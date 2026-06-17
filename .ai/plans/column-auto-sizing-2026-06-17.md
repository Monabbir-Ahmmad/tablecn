# Plan: Column Auto-Sizing

**Date:** 2026-06-17  
**Status:** Draft

## Goal

When `enableColumnResizing` is on, double-clicking a column's resize handle auto-sizes that column to fit its widest visible content — matching the behavior of MUI X Data Grid and Excel. Optionally expose an "auto-size all" action.

## Measurement Strategy

### Why Not Pure DOM Measurement

With row virtualization enabled, only the visible subset of rows is in the DOM. Pure `scrollWidth` measurement would only size to the visible window, not the full dataset.

### Hybrid Approach

1. **DOM measurement for visible cells** — query rendered `<td>` / `<th>` cells in the target column and read their `scrollWidth`. Fast, pixel-accurate, works for non-virtualized tables.
2. **Canvas text measurement for the full dataset** — use `OffscreenCanvas` (or a hidden `<canvas>`) to measure text widths for every row's raw cell value, then take the max. Requires knowing the font (read from a rendered cell via `getComputedStyle`). Works with virtualization.

For the initial implementation: **DOM-first, canvas fallback**. For virtualized tables, we measure visible DOM cells plus canvas-measure the rest of the data, using the full dataset accessible from `table.getRowModel().rows`.

### Canvas Text Measurement

```ts
function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  ctx.font = font
  return ctx.measureText(text).width
}
```

The font is read once from a rendered cell: `getComputedStyle(cellEl).font`.

### Width Calculation

```
autoWidth = max(
  ...allRows.map(row => measureCell(row, column)),
  measureHeader(column)
) + CELL_PADDING + COLUMN_ACTIONS_WIDTH
```

Where:
- `CELL_PADDING` = left + right padding for the current density (read from `DENSITY_CELL_PADDING`)
- `COLUMN_ACTIONS_WIDTH` = ~28px for sort icon, ~20px for actions menu trigger

Cap at `MAX_AUTO_SIZE_WIDTH = 400` to prevent absurdly wide columns.

## Files to Change

### 1. New: `packages/tablecn/src/helpers/measure-column-width.ts`

Pure helper — no React, no table instance.

```ts
export interface MeasureColumnWidthOptions {
  font: string        // CSS font string from a rendered cell
  padding: number     // total horizontal padding (left + right) in px
  extraWidth?: number // extra space for icons (actions button, sort arrow)
  maxWidth?: number   // cap, default 400
}

export function measureColumnWidth(
  values: string[],   // all cell text values for the column
  headerText: string,
  options: MeasureColumnWidthOptions
): number
```

Internally uses a single `<canvas>` for all measurements to avoid DOM thrashing.

### 2. `packages/tablecn/src/components/data-table/core/types.ts`

Add to `DataTableConfig` and `UseDataTableOptions`:

```ts
// UseDataTableOptions
enableColumnAutosize?: boolean
// default: true when enableColumnResizing is true

// DataTableConfig  
enableColumnAutosize: boolean
autoSizeColumn: (columnId: string) => void
autoSizeAllColumns: () => void
```

The two imperative methods live on `cnTable` so any component can call them.

### 3. `packages/tablecn/src/components/data-table/core/use-data-table.ts`

Wire the option and build `autoSizeColumn` / `autoSizeAllColumns`:

```ts
const enableColumnAutosize = options.enableColumnAutosize ?? enableColumnResizing

const autoSizeColumn = React.useCallback((columnId: string) => {
  // 1. Find a rendered cell in this column to read the font
  const containerEl = refs.tableContainerRef.current
  if (!containerEl) return
  const cellEl = containerEl.querySelector(
    `[data-column-id="${columnId}"]`
  ) as HTMLElement | null
  const font = cellEl
    ? getComputedStyle(cellEl).font
    : "14px sans-serif"

  // 2. Collect all string values for this column
  const col = table.getColumn(columnId)
  if (!col) return
  const values = table.getRowModel().rows.map((row) => {
    const val = row.getValue(columnId)
    return val != null ? String(val) : ""
  })
  const headerText = columnLabel(col)

  // 3. Measure
  const density = table.cnTable.density
  const padding = DENSITY_CELL_PADDING[density] * 2
  const width = measureColumnWidth(values, headerText, { font, padding, extraWidth: 48 })

  // 4. Apply
  table.setColumnSizing((prev) => ({ ...prev, [columnId]: width }))
}, [table, refs])

const autoSizeAllColumns = React.useCallback(() => {
  table.getVisibleLeafColumns().forEach((col) => {
    if (!col.getCanResize()) return
    autoSizeColumn(col.id)
  })
}, [table, autoSizeColumn])
```

### 4. Find and update the resize handle component

Locate the resize handle (likely in `packages/tablecn/src/components/body/dnd/` or `components/head/`). Add `onDoubleClick`:

```tsx
<div
  className="absolute right-0 ... cursor-col-resize"
  onMouseDown={header.getResizeHandler()}
  onDoubleClick={(e) => {
    e.stopPropagation()
    if (table.cnTable.enableColumnAutosize) {
      table.cnTable.autoSizeColumn(header.column.id)
    }
  }}
/>
```

The resize handle already has a `cursor-col-resize` style; add `cursor-ew-resize` on hover to hint at the double-click behavior (standard convention in spreadsheet apps).

### 5. `packages/tablecn/src/components/data-table/components/toolbar/controls/` (Optional)

Add a toolbar button `DataTableAutosizeToggle` (similar to `DataTableDensityToggle`) that calls `autoSizeAllColumns()`. Shown only when `enableColumnResizing && enableColumnAutosize`. Add it to the toolbar cluster in `data-table-toolbar.tsx`.

The CLAUDE.md says not to add features beyond what's required — omit the toolbar button unless the user requests it; the double-click behavior is the core deliverable.

## API Surface

```ts
useDataTable({
  enableColumnResizing: true,
  enableColumnAutosize: true,  // default true when resizing is on
})
```

```ts
// Imperative (via ref or cnTable):
table.cnTable.autoSizeColumn("firstName")
table.cnTable.autoSizeAllColumns()
```

## Edge Cases

| Scenario | Handling |
|---|---|
| Column virtualization on | Only visible cells are in DOM; canvas measurement covers all data rows |
| Custom `cell` renderer | Cell renders HTML, not plain text — measure DOM `scrollWidth` of rendered cells only; canvas fallback is skipped for custom cells |
| Column has no rows (empty table) | Width = header measurement + padding only |
| Group header column | `header.subHeaders.length > 0` — skip (group headers are not resizable) |
| `minSize` / `maxSize` on column def | Clamp the measured width to `[column.columnDef.minSize, column.columnDef.maxSize]` |

## No New Dependencies

`<canvas>` is a browser built-in. No new packages.

## Estimated Effort

Small–Medium. ~3–4 files. The canvas measurement helper is the only non-trivial piece.
