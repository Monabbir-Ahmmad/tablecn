"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../../core/types"

/** Funnel toggle that shows/hides the filter row. */
export function DataTableFilterToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, showColumnFilters, setShowColumnFilters } =
    table.cnTable
  const label = showColumnFilters
    ? localization.hideColumnFilters
    : localization.showColumnFilters
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={showColumnFilters}
          onClick={() => setShowColumnFilters((prev) => !prev)}
          className={cn("size-8", showColumnFilters && "bg-muted text-foreground")}
        >
          <icons.filter />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
