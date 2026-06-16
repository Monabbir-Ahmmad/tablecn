import {
  getSortedRowModel,
  type Row,
  type RowData,
  type RowModel,
  type Table,
} from "@tanstack/react-table"
import type { RankingInfo } from "@tanstack/match-sorter-utils"

/**
 * Descending comparator over the best fuzzy rank a row earned across the
 * columns the global search ran on. Drives `enableGlobalFilterRankedResults`.
 * Ranks are written to `row.columnFiltersMeta` by the fuzzy branch of
 * `createGlobalFilterFn`; only that branch writes meta, so this never picks up
 * per-column filter state.
 */
export function rankGlobalFuzzy<TData extends RowData>(
  rowA: Row<TData>,
  rowB: Row<TData>
): number {
  const best = (row: Row<TData>): number => {
    let max = -Infinity
    for (const meta of Object.values(row.columnFiltersMeta)) {
      const rank = (meta as RankingInfo | undefined)?.rank
      if (rank != null && rank > max) max = rank
    }
    return max === -Infinity ? 0 : max
  }
  return best(rowB) - best(rowA)
}

/**
 * Wraps TanStack's sorted row model. When `isActive(table)` is true (the caller
 * decides: fuzzy global search on, no user sort, no grouping/expansion), the
 * top-level rows are re-ordered by best fuzzy rank; otherwise the normal sorted
 * model passes through untouched. Re-ordering at the sorted-model layer means
 * pagination, pinning, and the body all observe the ranked order with no extra
 * wiring. The result is cached per underlying model object, so the sort only
 * re-runs when filtering/sorting/data actually change.
 */
export function createRankedSortedRowModel<TData extends RowData>(
  isActive: (table: Table<TData>) => boolean
): (table: Table<TData>) => () => RowModel<TData> {
  const base = getSortedRowModel<TData>()
  return (table) => {
    const delegate = base(table)
    let cachedFor: RowModel<TData> | null = null
    let cached: RowModel<TData> | null = null
    return () => {
      const model = delegate()
      if (!isActive(table)) return model
      if (cached && cachedFor === model) return cached
      cached = { ...model, rows: [...model.rows].sort(rankGlobalFuzzy) }
      cachedFor = model
      return cached
    }
  }
}
