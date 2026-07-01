"use client"

import { DndContext } from "@dnd-kit/core"
import { type RowData } from "@tanstack/react-table"
import * as React from "react"

import { Table, TableCaption } from "@workspace/ui/components/table"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { DataTableBody } from "../components/body/data-table-body"
import {
  DataTableFooter,
  hasFooter,
} from "../components/body/data-table-footer"
import { DataTableEditModal } from "../components/editing/data-table-edit-modal"
import { DataTableHeader } from "../components/head/data-table-header"
import { DataTableAlertBanner } from "../components/toolbar/data-table-alert-banner"
import { DataTableBottomToolbar } from "../components/toolbar/data-table-bottom-toolbar"
import { DataTableDropToGroupZone } from "../components/toolbar/data-table-grouping"
import { DataTablePagination } from "../components/toolbar/data-table-pagination"
import { DataTableToolbar } from "../components/toolbar/data-table-toolbar"
import { useGridNavigation } from "../hooks/use-grid-navigation"
import { useTableDnd } from "../hooks/use-table-dnd"
import { useTableVirtualizers } from "../hooks/use-table-virtualizers"
import { getColumnSizeVars } from "../utils/column-styles"
import { type DataTableInstance } from "./types"

/**
 * Body wrapper that freezes during an active column resize. With
 * `columnResizeMode: "onChange"` the table re-renders on every mousemove;
 * skipping the body's re-render keeps drags smooth, since column widths come
 * from the CSS size vars on `<table>` and update without React. Outside of a
 * resize the comparator returns false, so normal re-rendering is unchanged.
 */
const MemoizedDataTableBody = React.memo(
  DataTableBody,
  (_prev, next) =>
    next.table.getState().columnSizingInfo.isResizingColumn !== false
) as typeof DataTableBody

interface DataTableProps<
  TData extends RowData,
> extends React.ComponentProps<"div"> {
  table: DataTableInstance<TData>
  /** Page-size options for the bottom pagination control. */
  pageSizeOptions?: number[]
  /** Extra classes for the scrollable table surface (e.g. a max-height to
   *  engage the sticky header/footer or to bound a virtualized list). */
  surfaceClassName?: string
}

/**
 * Renders a data table from an instance produced by {@link useDataTable}.
 * Vertical stack: top toolbar → alert banner → drop-to-group zone → bordered
 * surface (sticky header, optional filter row, body, optional sticky footer) →
 * pagination. Wires DnD column/row ordering, pinning, resizing, grouping,
 * expansion, and detail panels.
 */
export function DataTable<TData extends RowData>({
  table,
  pageSizeOptions,
  surfaceClassName,
  className,
  ...props
}: DataTableProps<TData>) {
  const {
    density,
    isFullscreen,
    showProgressBars,
    showLoadingOverlay,
    enableColumnResizing,
    enableGrouping,
    enableRowVirtualization,
    enablePagination,
    positionPagination,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    enableTopToolbar,
    enableKeyboardNavigation,
    renderCaption,
    renderTopToolbar,
    refs,
  } = table.cnTable

  const { ref: gridRef, onKeyDown } = useGridNavigation<HTMLDivElement>(
    enableKeyboardNavigation
  )
  const { sensors, collisionDetection, handleDragEnd } = useTableDnd(table)
  const { rowVirtualizer, virtualItems, virtualColumns, withColumnSpacers } =
    useTableVirtualizers(table, gridRef)

  const hasRows =
    table.getTopRows().length +
      table.getCenterRows().length +
      table.getBottomRows().length >
    0
  const showFooter = hasFooter(table)

  const columnSizing = table.getState().columnSizing
  const columnSizingInfo = table.getState().columnSizingInfo
  const columnSizeVars = React.useMemo(
    () => (enableColumnResizing ? getColumnSizeVars(table) : {}),
    // columnSizing/Info are intentional triggers: recompute vars on resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableColumnResizing, table, columnSizing, columnSizingInfo]
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={refs.tablePaperRef}
        data-slot="data-table"
        className={cn(
          "flex w-full flex-col gap-2",
          isFullscreen &&
            "fixed inset-0 z-50 gap-2 overflow-auto bg-background p-4",
          className
        )}
        data-density={density}
        {...props}
      >
        {renderTopToolbar
          ? renderTopToolbar({ table })
          : enableTopToolbar && (
              <DataTableToolbar
                table={table}
                toolbarRef={refs.topToolbarRef}
                searchInputRef={refs.searchInputRef}
              />
            )}
        {positionToolbarAlertBanner === "top" && (
          <DataTableAlertBanner table={table} />
        )}

        {enablePagination &&
          (positionPagination === "top" || positionPagination === "both") && (
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
            />
          )}

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragEnd={handleDragEnd}
        >
          {enableGrouping &&
            (positionToolbarDropZone === "top" ||
              positionToolbarDropZone === "both") && (
              <DataTableDropToGroupZone table={table} />
            )}

          <div
            ref={(node) => {
              gridRef.current = node
              refs.tableContainerRef.current = node
            }}
            onKeyDown={onKeyDown}
            data-slot="data-table-surface"
            className={cn(
              // This surface is the single scroll container for both axes, so
              // the sticky header/footer engage and the horizontal scrollbar
              // stays pinned to the visible bottom. Neutralize the shadcn
              // <Table> wrapper's own overflow so it doesn't become a second
              // (unbounded) scroll container that breaks sticky positioning.
              "relative overflow-auto rounded-md border *:data-[slot=table-container]:overflow-visible",
              enableRowVirtualization && "max-h-150",
              surfaceClassName
            )}
          >
            {showProgressBars && (
              <div
                data-slot="data-table-progress"
                className="absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden bg-primary/20"
                role="presentation"
              >
                {/* @keyframes can't go in an inline style attribute, so the rule
                    lives in this co-located <style> — keeping the table
                    self-contained (no globals.css / registry CSS needed). The
                    animation itself is applied inline; reduced motion stops it. */}
                <style>
                  {
                    "@keyframes data-table-progress{from{transform:translateX(-100%)}to{transform:translateX(400%)}}@media (prefers-reduced-motion:reduce){[data-slot=data-table-progress-bar]{animation:none!important}}"
                  }
                </style>
                <div
                  data-slot="data-table-progress-bar"
                  className="h-full w-1/3 bg-primary"
                  style={{
                    animation: "data-table-progress 1.1s ease-in-out infinite",
                  }}
                />
              </div>
            )}

            <Table
              style={{
                ...columnSizeVars,
                // Fixed layout makes per-column widths authoritative (auto
                // layout would stretch/redistribute them and ignore a resize).
                // `max(100%, totalSize)` keeps the table at least as wide as the
                // surface: when the columns are narrower than the surface, fixed
                // layout distributes the slack proportionally so they fill it
                // (no trailing empty space); when they outgrow the surface, the
                // table exceeds 100% and scrolls horizontally.
                ...(enableColumnResizing
                  ? { width: `max(100%, ${table.getTotalSize()}px)` }
                  : null),
              }}
              className={cn(enableColumnResizing && "table-fixed")}
            >
              {renderCaption && (
                <TableCaption>{renderCaption({ table })}</TableCaption>
              )}
              <DataTableHeader
                table={table}
                virtualColumns={virtualColumns}
                withColumnSpacers={withColumnSpacers}
              />
              <MemoizedDataTableBody
                table={table}
                rowVirtualizer={rowVirtualizer}
                virtualItems={virtualItems}
                virtualColumns={virtualColumns}
                withColumnSpacers={withColumnSpacers}
              />
              {showFooter && (
                <DataTableFooter
                  table={table}
                  virtualColumns={virtualColumns}
                  withColumnSpacers={withColumnSpacers}
                />
              )}
            </Table>

            {showLoadingOverlay && hasRows && (
              <div
                className="absolute inset-0 z-10 bg-background/40"
                aria-hidden
              />
            )}
          </div>

          {enableGrouping &&
            (positionToolbarDropZone === "bottom" ||
              positionToolbarDropZone === "both") && (
              <DataTableDropToGroupZone table={table} />
            )}
        </DndContext>

        {positionToolbarAlertBanner === "bottom" && (
          <DataTableAlertBanner table={table} />
        )}

        <DataTableBottomToolbar
          table={table}
          pageSizeOptions={pageSizeOptions}
        />

        <DataTableEditModal table={table} />
      </div>
    </TooltipProvider>
  )
}
