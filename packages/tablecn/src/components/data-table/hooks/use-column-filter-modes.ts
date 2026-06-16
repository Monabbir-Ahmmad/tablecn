"use client"

import * as React from "react"
import type { ColumnDef, FilterFn, RowData } from "@tanstack/react-table"

import {
  createDynamicFilterFn,
  defaultModeForVariant,
  type FilterMode,
} from "../fns/filter-fns"
import { columnKey } from "../helpers/column-key"

export interface ColumnFilterModes<TData extends RowData> {
  columnFilterModes: Record<string, FilterMode>
  setColumnFilterModes: React.Dispatch<
    React.SetStateAction<Record<string, FilterMode>>
  >
  /** Resolve the active mode for a column (active → default → "contains"). */
  getColumnMode: (columnId: string) => FilterMode
  /** Single dynamic filter fn assigned to every column via `defaultColumn`. */
  dynamicFilterFn: FilterFn<TData>
}

/**
 * Per-column filter-mode state and the dynamic filter function that reads it.
 * Default modes are derived from each column's `meta.filterMode` / `meta.variant`.
 * Modes are read through refs so the filter fn keeps a stable identity (changing
 * it would thrash the filtered row model every render).
 *
 * The value-resetting `setColumnFilterMode` action lives in `useDataTable`
 * because it needs the table instance, which can't exist before this hook
 * supplies `dynamicFilterFn`.
 */
export function useColumnFilterModes<TData extends RowData>(
  columns: ColumnDef<TData, unknown>[]
): ColumnFilterModes<TData> {
  const [columnFilterModes, setColumnFilterModes] = React.useState<
    Record<string, FilterMode>
  >({})

  // Per-column default mode derived from `meta.filterMode` / `meta.variant`.
  const defaultModes = React.useMemo(() => {
    const map: Record<string, FilterMode> = {}
    for (const def of columns) {
      const key = columnKey(def as { id?: string; accessorKey?: unknown })
      if (!key) continue
      const meta = def.meta
      map[key] =
        meta?.filterMode ?? defaultModeForVariant(meta?.variant ?? "text")
    }
    return map
  }, [columns])

  // Refs let the dynamic filterFn read current modes without re-creating its
  // identity (which would thrash the filtered row model on every render).
  const modesRef = React.useRef(columnFilterModes)
  modesRef.current = columnFilterModes
  const defaultModesRef = React.useRef(defaultModes)
  defaultModesRef.current = defaultModes

  const getColumnMode = React.useCallback(
    (columnId: string): FilterMode =>
      modesRef.current[columnId] ??
      defaultModesRef.current[columnId] ??
      "contains",
    []
  )

  const dynamicFilterFn = React.useMemo(
    () => createDynamicFilterFn<TData>(getColumnMode),
    [getColumnMode]
  )

  return {
    columnFilterModes,
    setColumnFilterModes,
    getColumnMode,
    dynamicFilterFn,
  }
}
