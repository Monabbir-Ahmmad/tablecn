"use client"

import {
  flexRender,
  type Header,
  type RowData,
} from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { DataTableColumnActions } from "../menus/data-table-column-actions"
import { getColumnLabel } from "../../helpers/column-label"
import { DataTableColumnFilter } from "./data-table-column-filter"
import type { DataTableInstance } from "../../core/types"

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
}

const ALIGN_CLASS = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
} as const

/**
 * Wraps every header cell with the MRT layout: label (sort trigger) · sort
 * indicator · multi-sort order badge · column-actions menu, left-aligned by
 * default. Clicking the label cycles asc → desc → none; shift-click multi-sorts
 * (both via TanStack's `getToggleSortingHandler`).
 */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  header,
  table,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { column } = header
  const { localization, icons, enableColumnActions, columnFilterDisplayMode } =
    table.cnTable
  const align = column.columnDef.meta?.align ?? "left"

  const showFilterPopover =
    columnFilterDisplayMode === "popover" && column.getCanFilter()
  const hasFilter = column.getFilterValue() != null
  const filterPopover = showFilterPopover ? (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={localization.filterByColumn(getColumnLabel(column))}
              className={cn(
                "size-7 opacity-70 transition-opacity group-hover/th:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                hasFilter && "text-primary opacity-100"
              )}
            >
              {hasFilter ? <icons.filter /> : <icons.filterOff />}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {localization.filterByColumn(getColumnLabel(column))}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-64 gap-2">
        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {localization.filterByColumn(getColumnLabel(column))}
        </span>
        <DataTableColumnFilter header={header} table={table} />
      </PopoverContent>
    </Popover>
  ) : null

  const labelNode = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, header.getContext())

  const canSort = column.getCanSort()
  const sorted = column.getIsSorted() // false | "asc" | "desc"
  const sortIndex = column.getSortIndex()
  const isMultiSort =
    table.getState().sorting.length > 1 && sortIndex >= 0

  const showActions =
    enableColumnActions &&
    !column.columnDef.meta?.disableColumnActions &&
    (canSort ||
      column.getCanHide() ||
      column.getCanFilter() ||
      (table.cnTable.enableColumnPinning && column.getCanPin()) ||
      (table.cnTable.enableGrouping && column.getCanGroup()))

  // Non-interactive header (e.g. the selection column): render content plainly.
  if (!canSort && !showActions) {
    return (
      <div className={cn("flex items-center gap-1", ALIGN_CLASS[align])}>
        {labelNode}
        {filterPopover}
      </div>
    )
  }

  const sortTooltip = !sorted
    ? localization.sortByColumnAsc(getColumnLabel(column))
    : sorted === "asc"
      ? localization.sortByColumnDesc(getColumnLabel(column))
      : localization.clearSort

  return (
    <div
      className={cn(
        "group/th flex items-center gap-0.5",
        align === "right" && "flex-row-reverse",
        ALIGN_CLASS[align]
      )}
    >
      {canSort ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={column.getToggleSortingHandler()}
              aria-label={sortTooltip}
              className="-mx-1.5 flex items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-medium tracking-wider uppercase whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 data-[sorted=true]:text-foreground"
              data-sorted={!!sorted}
            >
              <span>{labelNode}</span>
              <SortIndicator sorted={sorted} icons={icons} />
              {isMultiSort && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-4 min-w-4 justify-center rounded-sm px-1 text-[10px] leading-none tabular-nums"
                >
                  {sortIndex + 1}
                </Badge>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{sortTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="px-0 text-xs font-medium tracking-wider uppercase whitespace-nowrap">
          {labelNode}
        </span>
      )}

      {showActions && (
        <DataTableColumnActions
          column={column}
          table={table}
          className="-my-1"
        />
      )}
      {filterPopover}
    </div>
  )
}

function SortIndicator({
  sorted,
  icons,
}: {
  sorted: false | "asc" | "desc"
  icons: DataTableInstance["cnTable"]["icons"]
}) {
  if (sorted === "asc") return <icons.sortAscending className="size-3.5" />
  if (sorted === "desc") return <icons.sortDescending className="size-3.5" />
  return (
    <icons.sortUnsorted className="size-3.5 opacity-50 transition-opacity group-hover/th:opacity-70" />
  )
}
