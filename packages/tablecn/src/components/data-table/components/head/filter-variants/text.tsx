"use client"

import type { RowData } from "@tanstack/react-table"

import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import { VALUELESS_MODES } from "../../../fns/filter-fns"
import {
  ClearableInput,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"

export function TextFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const mode = getEffectiveMode(column, table)
  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }
  const value = (column.getFilterValue() ?? "") as string
  return (
    <ClearableInput
      value={value}
      onChange={(next) => column.setFilterValue(next || undefined)}
      placeholder={localization.filterPlaceholder(getColumnLabel(column))}
      ariaLabel={localization.filterByColumn(getColumnLabel(column))}
      clearLabel={localization.clearFilter}
      ClearIcon={icons.clear}
    />
  )
}
