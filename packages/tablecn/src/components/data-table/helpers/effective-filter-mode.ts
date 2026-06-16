import type { Column, RowData } from "@tanstack/react-table"

import { defaultModeForVariant, type FilterMode } from "../fns/filter-fns"
import type { DataTableInstance } from "../core/types"

/** Effective filter mode for a column: explicit selection → meta → variant default. */
export function getEffectiveMode<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: DataTableInstance<TData>
): FilterMode {
  const variant = column.columnDef.meta?.variant ?? "text"
  return (
    table.cnTable.columnFilterModes[column.id] ??
    column.columnDef.meta?.filterMode ??
    defaultModeForVariant(variant)
  )
}
