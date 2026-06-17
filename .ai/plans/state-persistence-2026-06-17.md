# Plan: State Persistence

**Date:** 2026-06-17  
**Status:** Draft

## Goal

Automatically save and restore table UI state (column visibility, sort, filters, sizing, etc.) across page reloads. Consumers opt in by passing a `statePersistenceKey`. Storage target is `localStorage` by default; a custom adapter can replace it.

## What State to Persist

These are all "UI preference" state that makes sense to persist. Omit data-state like `expanded` (transient, row-id dependent) and `rowSelection` (intent-dependent).

| State Slice | TanStack key | Notes |
|---|---|---|
| Column visibility | `columnVisibility` | Which columns are shown/hidden |
| Column order | `columnOrder` | User-reordered column sequence |
| Column pinning | `columnPinning` | Left/right pinned columns |
| Column sizing | `columnSizing` | Drag-resized widths |
| Sorting | `sorting` | Active sort column(s) + direction |
| Column filters | `columnFilters` | Per-column filter values |
| Global filter | `globalFilter` | Global search string |
| Pagination | `pagination` | Page index + page size |
| Grouping | `grouping` | Grouped column ids |
| Density | *(cnTable)* | compact / comfortable / spacious |
| Column filter modes | *(cnTable)* | Per-column filter mode |
| Global filter mode | *(cnTable)* | fuzzy / contains / etc. |
| Show column filters | *(cnTable)* | Filter row visibility |

## API

```ts
useDataTable({
  // Opt-in: a stable string key unique to this table.
  // When set, state is read from and written to storage automatically.
  statePersistenceKey?: string

  // Storage target. Default: "localStorage".
  // "none" disables persistence even when a key is set.
  statePersistenceStorage?: "localStorage" | "sessionStorage" | "none"

  // Which state slices to persist. Default: all slices listed above.
  // Pass an array to include only the named slices.
  statePersistenceWhitelist?: Array<keyof PersistedTableState>

  // Called after state is restored from storage (e.g. to log or sync elsewhere).
  onStateRestore?: (state: Partial<PersistedTableState>) => void
})
```

## Type: `PersistedTableState`

```ts
export interface PersistedTableState {
  columnVisibility?: ColumnVisibilityState
  columnOrder?: ColumnOrderState
  columnPinning?: ColumnPinningState
  columnSizing?: ColumnSizingState
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  globalFilter?: string
  pagination?: PaginationState
  grouping?: GroupingState
  density?: Density
  columnFilterModes?: Record<string, FilterMode>
  globalFilterMode?: GlobalFilterMode
  showColumnFilters?: boolean
}
```

## Implementation

### New: `packages/tablecn/src/hooks/use-state-persistence.ts`

```ts
function useStatePersistence<TData extends RowData>(
  options: StatePersistenceOptions,
  table: DataTableInstance<TData>
): void
```

**Read phase (mount only, synchronous):**

Reading synchronously before the first render is critical to avoid a flash of default state. Since `useReactTable` accepts `initialState`, we read persisted state in a `useMemo` with empty deps inside `useDataTable` *before* calling `useReactTable`, and pass it as `initialState`.

```ts
// Inside useDataTable, before useReactTable:
const restoredState = React.useMemo(() => {
  if (!statePersistenceKey) return {}
  if (statePersistenceStorage === "none") return {}
  try {
    const storage = statePersistenceStorage === "sessionStorage"
      ? sessionStorage : localStorage
    const raw = storage.getItem(statePersistenceKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<PersistedTableState>
    return applyWhitelist(parsed, statePersistenceWhitelist)
  } catch {
    return {}
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps
// empty deps: read once at mount, never re-read (avoids storage as dep)
```

Then spread into `initialState`:
```ts
const table = useReactTable({
  initialState: {
    ...restoredState,          // restored TanStack slices
    ...tableOptions.initialState, // consumer overrides win
  },
  ...
})
```

For the cnTable slices (`density`, `columnFilterModes`, `globalFilterMode`, `showColumnFilters`), pass the restored values as the `default*` props of the controllable-state hooks:
```ts
const [density, setDensity] = useControllableState<Density>(
  densityProp,
  restoredState.density ?? defaultDensity,
  onDensityChange
)
// same for showColumnFilters, columnFilterModes initial values, globalFilterMode
```

**Write phase (debounced effect):**

```ts
// In use-state-persistence.ts, called from useDataTable after table is created:
function useStatePersistenceWrite(table, options) {
  const {
    statePersistenceKey,
    statePersistenceStorage = "localStorage",
    statePersistenceWhitelist,
  } = options

  const state = table.getState()
  const { density, columnFilterModes, globalFilterMode, showColumnFilters } = table.cnTable

  useEffect(() => {
    if (!statePersistenceKey || statePersistenceStorage === "none") return

    const timer = setTimeout(() => {
      const toSave: PersistedTableState = {
        columnVisibility: state.columnVisibility,
        columnOrder: state.columnOrder,
        columnPinning: state.columnPinning,
        columnSizing: state.columnSizing,
        sorting: state.sorting,
        columnFilters: state.columnFilters,
        globalFilter: state.globalFilter,
        pagination: state.pagination,
        grouping: state.grouping,
        density,
        columnFilterModes,
        globalFilterMode,
        showColumnFilters,
      }
      const filtered = applyWhitelist(toSave, statePersistenceWhitelist)
      try {
        const storage = statePersistenceStorage === "sessionStorage"
          ? sessionStorage : localStorage
        storage.setItem(statePersistenceKey, JSON.stringify(filtered))
      } catch {
        // storage full or unavailable — fail silently
      }
    }, 300) // debounce: don't write on every keystroke

    return () => clearTimeout(timer)
  }, [
    statePersistenceKey, statePersistenceStorage,
    state.columnVisibility, state.columnOrder, state.columnPinning,
    state.columnSizing, state.sorting, state.columnFilters,
    state.globalFilter, state.pagination, state.grouping,
    density, columnFilterModes, globalFilterMode, showColumnFilters,
    statePersistenceWhitelist,
  ])
}
```

### Helper: `applyWhitelist`

```ts
function applyWhitelist(
  state: Partial<PersistedTableState>,
  whitelist?: Array<keyof PersistedTableState>
): Partial<PersistedTableState> {
  if (!whitelist) return state
  return Object.fromEntries(
    whitelist.map((k) => [k, state[k]])
  ) as Partial<PersistedTableState>
}
```

### Export a `clearPersistedState` utility

```ts
export function clearPersistedTableState(
  key: string,
  storage: "localStorage" | "sessionStorage" = "localStorage"
): void {
  try {
    const s = storage === "sessionStorage" ? sessionStorage : localStorage
    s.removeItem(key)
  } catch {}
}
```

Consumers call this to implement a "Reset to defaults" button.

## Files to Change

| File | Change |
|---|---|
| `core/types.ts` | Add `StatePersistenceOptions`, `PersistedTableState` types; extend `UseDataTableOptions` |
| `core/use-data-table.ts` | Read state before `useReactTable`; call `useStatePersistenceWrite` after |
| New: `hooks/use-state-persistence.ts` | The write-phase debounced effect |
| `index.ts` | Export `PersistedTableState`, `clearPersistedTableState`, `StatePersistenceOptions` |

## Edge Cases

| Scenario | Handling |
|---|---|
| Stored state references a column that no longer exists | TanStack Table ignores unknown column ids in state — safe to pass |
| Storage unavailable (SSR, private mode) | `try/catch` in both read and write; silent failure |
| Consumer passes `initialState` that conflicts with restored state | Consumer's `initialState` wins (spread order in the plan above) |
| `statePersistenceKey` changes at runtime | Clear old key, write to new key — handle via `useEffect` watching the key |
| Pagination page index persisted but data changed (fewer rows) | TanStack auto-clamps page index; no special handling needed |
| Schema version mismatch (app update changes column ids) | Add optional `statePersistenceVersion?: string`; clear storage when version differs |

## Estimated Effort

Small. ~3 files. The logic is straightforward; the main subtlety is reading synchronously before `useReactTable` to avoid flashing default state.
