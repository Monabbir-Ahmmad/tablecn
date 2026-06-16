"use client"

import type { RowData } from "@tanstack/react-table"
import { format } from "date-fns"

import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../../helpers/column-label"
import { getEffectiveMode } from "../../../helpers/effective-filter-mode"
import { VALUELESS_MODES } from "../../../fns/filter-fns"
import { DateRangeFilterField } from "./date-range"
import {
  CALENDAR_NAV_PROPS,
  FIELD_CLASS,
  ValuelessLabel,
  type FilterFieldProps,
} from "./shared"

export function DateFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const mode = getEffectiveMode(column, table)

  if (VALUELESS_MODES.has(mode)) {
    return <ValuelessLabel label={localization.filterModes[mode] ?? mode} />
  }

  // The `betweenDates` mode (and the date-range variant) selects a range.
  if (mode === "betweenDates") {
    return <DateRangeFilterField column={column} table={table} />
  }

  const value = column.getFilterValue() as Date | undefined
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(FIELD_CLASS, "w-full justify-start gap-2 px-2 font-normal")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          <icons.calendar className="text-muted-foreground" />
          {value ? (
            format(value, "PP")
          ) : (
            <span className="text-muted-foreground">{localization.pickDate}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => column.setFilterValue(date ?? undefined)}
          autoFocus
          {...CALENDAR_NAV_PROPS}
        />
      </PopoverContent>
    </Popover>
  )
}
