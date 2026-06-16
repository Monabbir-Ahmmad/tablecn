"use client"

import type { Column, RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../helpers/column-label"
import type { DataTableInstance } from "../../core/types"

interface DataTableColumnActionsProps<TData extends RowData, TValue> {
  column: Column<TData, TValue>
  table: DataTableInstance<TData>
  className?: string
}

/**
 * The MRT-signature per-column menu: a vertical-dots ghost button after the
 * header label that opens sort / hide / filter actions. Items render only when
 * the column supports them, so an ID column with sorting/filtering off shows
 * just the hide controls.
 */
export function DataTableColumnActions<TData extends RowData, TValue>({
  column,
  table,
  className,
}: DataTableColumnActionsProps<TData, TValue>) {
  const {
    localization,
    icons,
    setShowColumnFilters,
    columnFilterDisplayMode,
    enableColumnPinning,
    enableGrouping,
    renderColumnActionsMenuItems,
  } = table.cnTable
  const canSort = column.getCanSort()
  const canHide = column.getCanHide()
  const canFilter = column.getCanFilter()
  const canPin = enableColumnPinning && column.getCanPin()
  const canGroup = enableGrouping && column.getCanGroup()
  const isGrouped = column.getIsGrouped()
  const sorted = column.getIsSorted()
  const pinned = column.getIsPinned()
  const hasFilter = column.getFilterValue() != null

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={localization.columnActions}
              className={cn(
                "size-7 opacity-70 transition-opacity group-hover/th:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                className
              )}
            >
              <icons.columnActions />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{localization.columnActions}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-48">
        {canSort && (
          <>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              disabled={sorted === "asc"}
            >
              <icons.sortAscending />
              {localization.sortAscending}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              disabled={sorted === "desc"}
            >
              <icons.sortDescending />
              {localization.sortDescending}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.clearSorting()}
              disabled={!sorted}
            >
              <icons.clearAll />
              {localization.clearSort}
            </DropdownMenuItem>
          </>
        )}

        {canFilter && (
          <>
            {canSort && <DropdownMenuSeparator />}
            {columnFilterDisplayMode === "subheader" && (
              <DropdownMenuItem onClick={() => setShowColumnFilters(true)}>
                <icons.filter />
                {localization.filterByColumn(getColumnLabel(column))}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => column.setFilterValue(undefined)}
              disabled={!hasFilter}
            >
              <icons.filterOff />
              {localization.clearFilter}
            </DropdownMenuItem>
          </>
        )}

        {canHide && (
          <>
            {(canSort || canFilter) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <icons.hide />
              {localization.hideColumn}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.toggleAllColumnsVisible(true)}
            >
              <icons.clearAll />
              {localization.showAllColumns}
            </DropdownMenuItem>
          </>
        )}

        {canGroup && (
          <>
            {(canSort || canFilter || canHide) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => column.toggleGrouping()}>
              <icons.group />
              {isGrouped
                ? localization.ungroupByColumn(getColumnLabel(column))
                : localization.groupByColumn(getColumnLabel(column))}
            </DropdownMenuItem>
          </>
        )}

        {canPin && (
          <>
            {(canSort || canFilter || canHide || canGroup) && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              onClick={() => column.pin("left")}
              disabled={pinned === "left"}
            >
              <icons.pin />
              {localization.pinToLeft}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.pin("right")}
              disabled={pinned === "right"}
            >
              <icons.pin />
              {localization.pinToRight}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.pin(false)}
              disabled={!pinned}
            >
              <icons.unpin />
              {localization.unpin}
            </DropdownMenuItem>
          </>
        )}

        {renderColumnActionsMenuItems && (
          <>
            {(canSort || canFilter || canHide || canGroup || canPin) && (
              <DropdownMenuSeparator />
            )}
            {renderColumnActionsMenuItems({
              column: column as Column<TData, unknown>,
              table,
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
