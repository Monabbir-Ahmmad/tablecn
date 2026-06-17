# Plan: Filter Panel (AND/OR Logic)

**Date:** 2026-06-17  
**Status:** Draft

## Goal

A "Filter Panel" toolbar control that opens a side panel or dialog where users can build compound filter conditions — multiple rules joined by AND or OR logic — mirroring MUI X Data Grid's filter panel. Active rules are shown as a badge count on the toolbar button.

## Data Model

```ts
// A single filter rule: column + operator + value(s)
export interface AdvancedFilterRule {
  id: string            // stable React key (nanoid or crypto.randomUUID)
  columnId: string
  operator: AdvancedFilterOperator
  value: unknown        // string, number, Date, string[], or undefined
  value2?: unknown      // only for "between" operator
}

// The full filter state: a flat list of rules joined by a single logic mode
export interface AdvancedFilterGroup {
  logic: "and" | "or"
  rules: AdvancedFilterRule[]
}

export type AdvancedFilterOperator =
  // universal
  | "isEmpty"
  | "isNotEmpty"
  | "equals"
  | "notEquals"
  // text
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  // numeric / date
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "between"
```

Operator availability is gated by the column's `meta.variant` (or inferred type):

| Variant | Available operators |
|---|---|
| `text` (default) | contains, notContains, startsWith, endsWith, equals, notEquals, isEmpty, isNotEmpty |
| `select` / `multi-select` | equals, notEquals, isEmpty, isNotEmpty |
| `range` / `range-slider` | equals, notEquals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, between, isEmpty, isNotEmpty |
| `date` / `date-range` | equals, notEquals, greaterThan, lessThan, between, isEmpty, isNotEmpty |
| `checkbox` | equals (true/false) |

## Filter Application Strategy

TanStack Table applies column filters with AND logic between columns and does not natively support OR across columns. To support OR logic we need a parallel filter layer.

**Chosen approach: custom `getFilteredRowModel` override**

When `advancedFilter.rules.length > 0`, inject a custom `getFilteredRowModel` that:
1. Still applies TanStack's normal column filters (so both systems can coexist)
2. Additionally evaluates the `AdvancedFilterGroup` against each row

```ts
function evaluateRule(row: Row<any>, rule: AdvancedFilterRule): boolean {
  const value = row.getValue(rule.columnId)
  return applyOperator(value, rule.operator, rule.value, rule.value2)
}

function evaluateGroup(row: Row<any>, group: AdvancedFilterGroup): boolean {
  if (group.rules.length === 0) return true
  if (group.logic === "and") return group.rules.every((r) => evaluateRule(row, r))
  return group.rules.some((r) => evaluateRule(row, r))
}
```

**Integration with existing column filters:**

The two systems are additive — both must pass for a row to be shown. This is the same model as MUI X: the filter panel filters are independent of the quick-filter column inputs. A design note in the docs should clarify that both filter systems are active simultaneously; the user can clear one or both.

Alternatively: when the filter panel is opened and has active rules, offer a "Clear column filters" button inside the panel to avoid confusion.

## State

Added to `DataTableConfig<TData>` and `UseDataTableOptions<TData>`:

```ts
// UseDataTableOptions
enableAdvancedFilter?: boolean        // default false
advancedFilter?: AdvancedFilterGroup  // controlled
defaultAdvancedFilter?: AdvancedFilterGroup  // uncontrolled seed
onAdvancedFilterChange?: (filter: AdvancedFilterGroup) => void

// DataTableConfig (runtime)
enableAdvancedFilter: boolean
advancedFilter: AdvancedFilterGroup
setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterGroup>>
showAdvancedFilterPanel: boolean
setShowAdvancedFilterPanel: React.Dispatch<React.SetStateAction<boolean>>
```

`advancedFilter` uses `useControllableState` (existing pattern) to support both controlled and uncontrolled usage.

## Files to Add / Change

### 1. New: `packages/tablecn/src/fns/advanced-filter.ts`

The pure evaluation logic — no React, no UI.

```ts
export function evaluateAdvancedFilterGroup(
  row: Row<unknown>,
  group: AdvancedFilterGroup
): boolean

function applyOperator(
  cellValue: unknown,
  operator: AdvancedFilterOperator,
  value: unknown,
  value2: unknown
): boolean
```

Also export `getOperatorsForVariant(variant: FilterVariant): AdvancedFilterOperator[]` for the panel UI to use when populating the operator dropdown.

### 2. New: `packages/tablecn/src/hooks/use-advanced-filter.ts`

```ts
function useAdvancedFilter<TData extends RowData>(
  options: Pick<UseDataTableOptions<TData>, "enableAdvancedFilter" | "advancedFilter" | "defaultAdvancedFilter" | "onAdvancedFilterChange">
): {
  advancedFilter: AdvancedFilterGroup
  setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterGroup>>
  showAdvancedFilterPanel: boolean
  setShowAdvancedFilterPanel: React.Dispatch<React.SetStateAction<boolean>>
  filteredRowModel: ...  // custom row model override
}
```

Returns the custom `getFilteredRowModel` function that wraps TanStack's default and applies the advanced filter group on top. This is passed to `useReactTable` via `getFilteredRowModel` override.

### 3. `packages/tablecn/src/core/types.ts`

- Add `AdvancedFilterRule`, `AdvancedFilterGroup`, `AdvancedFilterOperator` types
- Extend `DataTableConfig` with `enableAdvancedFilter`, `advancedFilter`, `setAdvancedFilter`, `showAdvancedFilterPanel`, `setShowAdvancedFilterPanel`
- Extend `UseDataTableOptions` with corresponding props

### 4. `packages/tablecn/src/core/use-data-table.ts`

- Destructure new options
- Call `useAdvancedFilter`
- Wire the custom `getFilteredRowModel` to `useReactTable` when advanced filtering is active
- Add the new state to `config`

### 5. New: `packages/tablecn/src/components/toolbar/controls/advanced-filter-toggle.tsx`

Toolbar button that opens the panel. Shows an active-rule count badge.

```tsx
export function DataTableAdvancedFilterToggle<TData extends RowData>({
  table,
}: DataTableSlotProps<TData>) {
  const { advancedFilter, setShowAdvancedFilterPanel, icons } = table.cnTable
  const activeCount = advancedFilter.rules.length

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowAdvancedFilterPanel(true)}
      aria-label="Open advanced filters"
    >
      <icons.FilterListIcon />
      {activeCount > 0 && (
        <Badge className="absolute -top-1 -right-1 size-4 text-[10px]">
          {activeCount}
        </Badge>
      )}
    </Button>
  )
}
```

### 6. New: `packages/tablecn/src/components/menus/data-table-filter-panel.tsx`

A `<Sheet>` (side panel) that renders the filter builder UI. Prefer a sheet over a dialog — it doesn't obscure the table data while the user builds filters.

**Panel layout:**
```
┌─────────────────────────────────┐
│ Advanced Filters            [×] │
│ ─────────────────────────────── │
│ Match [ALL ▾] of the following: │
│ ─────────────────────────────── │
│ [Column ▾] [contains ▾] [value] [🗑] │
│ [Column ▾] [> ▾] [value]        [🗑] │
│ [+ Add Filter]                  │
│ ─────────────────────────────── │
│ [Clear All]       [Apply] [×]  │
└─────────────────────────────────┘
```

Each rule row:
- **Column selector**: `<Select>` populated with `table.getAllLeafColumns()` that `getCanFilter()`; display label from `column.columnDef.meta.label ?? column.id`
- **Operator selector**: `<Select>` populated by `getOperatorsForVariant(column.meta.variant)` — updates when column changes
- **Value input**: Rendered conditionally based on operator + variant:
  - Text operators → `<Input type="text">`
  - Numeric → `<Input type="number">`
  - Date → `<Input type="date">` (or the existing date picker from filter variants)
  - `isEmpty` / `isNotEmpty` → no value input
  - `between` → two value inputs

**Logic toggle** (`ALL` / `ANY`) maps to `group.logic = "and" | "or"`.

**Applying filters:** Changes are applied immediately (live preview) as the user builds — no separate "Apply" button needed. The "Clear All" button sets `rules: []`. The sheet can remain open while the user inspects the filtered results.

### 7. `packages/tablecn/src/components/toolbar/data-table-toolbar.tsx`

Add `DataTableAdvancedFilterToggle` to the internal actions cluster, after the existing filter toggle:

```tsx
{enableAdvancedFilter && (
  <DataTableAdvancedFilterToggle table={table} />
)}
```

Also render the `<DataTableFilterPanel>` (the sheet) outside the toolbar div but inside the same React subtree — sheets portal to `<body>` anyway.

### 8. `packages/tablecn/src/components/data-table/index.ts`

Export new public types:
```ts
export type { AdvancedFilterRule, AdvancedFilterGroup, AdvancedFilterOperator } from "./core/types"
```

## Localization

Add keys to `DataTableLocalization`:

```ts
advancedFilters: "Advanced Filters"
advancedFiltersMatchAll: "All"
advancedFiltersMatchAny: "Any"
advancedFiltersMatchLabel: "Match"
advancedFiltersOf: "of the following rules:"
advancedFiltersAddRule: "Add filter"
advancedFiltersClearAll: "Clear all"
advancedFiltersColumn: "Column"
advancedFiltersOperator: "Operator"
advancedFiltersValue: "Value"
// operators
operatorContains: "contains"
operatorNotContains: "does not contain"
operatorStartsWith: "starts with"
operatorEndsWith: "ends with"
operatorEquals: "equals"
operatorNotEquals: "does not equal"
operatorIsEmpty: "is empty"
operatorIsNotEmpty: "is not empty"
operatorGreaterThan: ">"
operatorGreaterThanOrEqual: "≥"
operatorLessThan: "<"
operatorLessThanOrEqual: "≤"
operatorBetween: "is between"
```

## New Dependencies

None required. The sheet component (`Sheet`) is already in `@workspace/ui` (added by shadcn). The badge may need to be added: `pnpm dlx shadcn@latest add badge -c apps/web`.

## Estimated Effort

Large. ~7 files, new state layer, custom row model, and a non-trivial UI component. Recommend splitting implementation into:
1. Data model + evaluation logic (`advanced-filter.ts`, types)
2. State hook + `useDataTable` wiring
3. Toolbar button (simple)
4. Filter panel UI (the bulk of the work)
5. Docs + example
