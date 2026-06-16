"use client"

import type { RowData } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../../helpers/column-label"
import {
  FIELD_CLASS,
  useSelectOptions,
  type FilterFieldProps,
} from "./shared"

export function MultiSelectFilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const { localization } = table.cnTable
  const { options, counts } = useSelectOptions(column)
  const selected = (column.getFilterValue() as string[]) ?? []

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    column.setFilterValue(next.length > 0 ? next : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(FIELD_CLASS, "w-full justify-between px-2 font-normal")}
          aria-label={localization.filterByColumn(getColumnLabel(column))}
        >
          {selected.length > 0 ? (
            <span className="flex items-center gap-1">
              <Badge variant="secondary" className="rounded-sm px-1">
                {selected.length}
              </Badge>
              <span className="truncate">{selected.join(", ")}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {localization.filterPlaceholder(getColumnLabel(column))}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={localization.search} className="h-8" />
          <CommandList>
            <CommandEmpty>{localization.noRecordsToDisplay}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggle(option.value)}
                    className="gap-2"
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {counts.get(option.value) ?? 0}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
