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
import {
  CALENDAR_NAV_PROPS,
  FIELD_CLASS,
  type FilterFieldProps,
} from "./shared"

export function DateRangeFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization, icons } = table.cnTable
  const value = (column.getFilterValue() as [Date?, Date?]) ?? [undefined, undefined]
  const from = value[0]
  const to = value[1]
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
          {from || to ? (
            <span>
              {from ? format(from, "PP") : "…"} – {to ? format(to, "PP") : "…"}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {localization.pickDateRange}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(range) =>
            column.setFilterValue(
              range?.from || range?.to ? [range?.from, range?.to] : undefined
            )
          }
          autoFocus
          {...CALENDAR_NAV_PROPS}
        />
      </PopoverContent>
    </Popover>
  )
}
