# Plan: Column Header Groups

**Date:** 2026-06-17  
**Status:** Draft

## Goal

Render nested/grouped column headers so that a group label (e.g. "Q1 Revenue") spans multiple child columns (e.g. Jan, Feb, Mar). TanStack Table already supports column groups via nested `columns` arrays in `ColumnDef`; this plan wires the rendering side.

## How TanStack Handles Header Groups

When column defs contain nested `columns`, `table.getHeaderGroups()` returns one row per depth level:

```
columns: [
  { id: "q1", header: "Q1", columns: [
    { accessorKey: "jan" },
    { accessorKey: "feb" },
  ]},
  { accessorKey: "total" }
]
```

Produces two header group rows:
- Row 0: `q1_header` (colSpan=2), `total_header` (colSpan=1)
- Row 1: `jan_header`, `feb_header`, `total_placeholder` (isPlaceholder=true)

The current `DataTableHeader` already iterates all header groups. The missing pieces are:
1. `colSpan` is not forwarded to `<th>` by `DataTableHeadCell`
2. Group-level headers need a simplified render (no sort, no filter, no resize, no actions)
3. The filter subheader row only applies to the deepest (leaf) header group
4. Column ordering / resizing / pinning should be disabled on group headers

## Files to Change

### 1. `packages/tablecn/src/components/data-table/components/body/dnd/data-table-head-cell.tsx`

**Add `colSpan` prop support.** The `<TableHead>` element needs `colSpan={header.colSpan}` when the header spans multiple columns.

```tsx
// In the component props, colSpan is already accessible via header.colSpan.
// Pass it through to the underlying <TableHead>:
<TableHead
  colSpan={header.colSpan > 1 ? header.colSpan : undefined}
  ...
>
```

Also suppress the resize handle when `header.colSpan > 1` (group headers are not resizable — resize their leaf children instead).

### 2. `packages/tablecn/src/components/data-table/components/head/data-table-header.tsx`

**Two changes:**

a) In `renderHeadCell`, pass `colSpan` context down so `DataTableHeadCell` can use it. (It already has `header` so this may be automatic once the head cell reads `header.colSpan`.)

b) Fix the filter subheader: currently it iterates all header groups for filter cells. With column groups, filters only belong on leaf headers. Change the filter row to use only the **last** header group (the deepest, leaf-column row):

```tsx
// Before: table.getHeaderGroups().map(...filter row...)
// After:
const leafHeaderGroup = table.getHeaderGroups().at(-1)
{filterRowVisible && leafHeaderGroup && (
  <TableRow key={`${leafHeaderGroup.id}-filters`} ...>
    {leafHeaderGroup.headers.map(renderFilterCell)}
  </TableRow>
)}
```

c) Group header rows (non-last) should not participate in `SortableContext` for column ordering since you can't drag a group header to reorder individual columns. Guard the `SortableContext` to the last (leaf) header group row, or check `headerGroup` depth.

### 3. `packages/tablecn/src/components/data-table/components/head/data-table-column-header.tsx`

**Render group headers differently.** A group header has `header.subHeaders.length > 0`. When this is true:
- Render only the header label, centered
- No sort button / sort indicator
- No column actions menu trigger
- No resize affordance
- Apply `text-center font-medium` styling

```tsx
const isGroupHeader = header.subHeaders.length > 0

if (isGroupHeader) {
  return (
    <div className="flex items-center justify-center px-2 py-1 font-medium text-sm">
      {flexRender(header.column.columnDef.header, header.getContext())}
    </div>
  )
}
// ...existing leaf header render
```

### 4. `packages/tablecn/src/components/data-table/components/head/data-table-column-filter.tsx`

**Guard against rendering a filter for a group header.** Group headers have `colSpan > 1`. Return `null` when `header.subHeaders.length > 0` (belt-and-suspenders since the filter row only renders the leaf group, but safe to add).

### 5. `packages/tablecn/src/components/data-table/core/types.ts`

No type changes required — TanStack's `ColumnDef<TData>` already allows `columns: ColumnDef<TData>[]` for nested groups. Consumers use TanStack's type directly.

Optionally, export a named type alias for documentation clarity:

```ts
// In index.ts (not types.ts):
export type { ColumnDef as DataTableColumnDef } from "@tanstack/react-table"
```

This is low-priority; the existing API already supports it implicitly.

## Behavior Details

| Scenario | Expected Behavior |
|---|---|
| Flat columns (no groups) | Identical to current — single header row, unchanged |
| Grouped columns | Multi-row header; group row spans children |
| Column ordering with groups | Only leaf columns are draggable; group headers are not drag sources |
| Column resizing with groups | Resize handle on leaf columns only |
| Column pinning with groups | Pinning a leaf column pins it; the group header spans only non-pinned children if some children are pinned |
| Filter row | Appears only under the leaf header group row |
| Column visibility | Hiding all children of a group hides the group header automatically (TanStack handles this) |

## No New Dependencies

TanStack Table already handles the column group logic. This is purely a rendering change.

## Estimated Effort

Small–Medium. ~4 files, no new state, no new deps. The trickiest part is verifying that `SortableContext` + column ordering doesn't break when group headers are mixed in.

## Demo / Example

Add example `ColumnGroups` to `apps/web/components/examples/` showing a financial table with "Q1", "Q2", "Q3", "Q4" groups spanning monthly sub-columns, plus a "Total" ungrouped column.
