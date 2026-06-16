"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"

interface PageResetParams {
  enablePagination: boolean
  manualPagination?: boolean
  autoResetPageIndex?: boolean
}

/**
 * Clamps to the first page when the filter set changes (MRT behaviour),
 * replacing TanStack's render-phase auto-reset (which warns in React 19 dev).
 * Runs after mount so there is no state update during render. Skipped under
 * manual pagination (server owns it) and when the consumer opted into the
 * native auto-reset.
 */
export function usePageResetOnFilterChange<TData extends RowData>(
  table: DataTableInstance<TData>,
  { enablePagination, manualPagination, autoResetPageIndex }: PageResetParams
): void {
  const columnFiltersKey = JSON.stringify(table.getState().columnFilters)
  const globalFilterValue = table.getState().globalFilter
  const didMountRef = React.useRef(false)
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (enablePagination && !manualPagination && autoResetPageIndex == null) {
      table.setPageIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFiltersKey, globalFilterValue])
}
