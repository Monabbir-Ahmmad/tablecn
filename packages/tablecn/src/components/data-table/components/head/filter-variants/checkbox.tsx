"use client"

import type { RowData } from "@tanstack/react-table"

import { Checkbox } from "@workspace/ui/components/checkbox"

import { getColumnLabel } from "../../../helpers/column-label"
import type { FilterFieldProps } from "./shared"

export function CheckboxFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const value = column.getFilterValue()
  const checked = value === true
  return (
    <label className="flex h-8 items-center gap-2 text-xs text-muted-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) =>
          column.setFilterValue(next === true ? true : undefined)
        }
        aria-label={localization.filterByColumn(getColumnLabel(column))}
      />
      {getColumnLabel(column)}
    </label>
  )
}
