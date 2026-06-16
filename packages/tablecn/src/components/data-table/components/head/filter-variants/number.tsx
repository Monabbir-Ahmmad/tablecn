"use client"

import type { RowData } from "@tanstack/react-table"

import { Input } from "@workspace/ui/components/input"

import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import { VALUELESS_MODES } from "../../../fns/filter-fns"
import {
  BETWEEN_MODES,
  FIELD_CLASS,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"

export function NumberFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const mode = getEffectiveMode(column, table)

  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }

  if (BETWEEN_MODES.has(mode)) {
    const value = (column.getFilterValue() ?? ["", ""]) as [
      string | number,
      string | number,
    ]
    const setBound = (index: 0 | 1, next: string) => {
      const draft: [string | number, string | number] = [
        value[0] ?? "",
        value[1] ?? "",
      ]
      draft[index] = next
      column.setFilterValue(
        draft[0] === "" && draft[1] === "" ? undefined : draft
      )
    }
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          inputMode="decimal"
          value={String(value[0] ?? "")}
          onChange={(e) => setBound(0, e.target.value)}
          placeholder={localization.min}
          aria-label={localization.min}
          className={FIELD_CLASS}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="decimal"
          value={String(value[1] ?? "")}
          onChange={(e) => setBound(1, e.target.value)}
          placeholder={localization.max}
          aria-label={localization.max}
          className={FIELD_CLASS}
        />
      </div>
    )
  }

  const value = (column.getFilterValue() ?? "") as string
  return (
    <Input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder={localization.filterPlaceholder(getColumnLabel(column))}
      aria-label={localization.filterByColumn(getColumnLabel(column))}
      className={FIELD_CLASS}
    />
  )
}
