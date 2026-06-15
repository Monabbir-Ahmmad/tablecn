"use client"

import * as React from "react"
import {
  flexRender,
  type Cell,
  type Column,
  type Header,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@monabbir/tablecn/components/table"
import { Skeleton } from "@monabbir/tablecn/components/skeleton"
import { TooltipProvider } from "@monabbir/tablecn/components/tooltip"
import { cn } from "@monabbir/tablecn/lib/utils"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getColumnSizeVars,
  getColumnWidthStyle,
} from "./column-styles"
import { DataTableColumnFilter } from "./data-table-column-filter"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableBodyRow, DataTableHeadCell } from "./data-table-dnd"
import { DataTableBodyCellContent } from "./data-table-edit-cell"
import { DataTableEditModal } from "./data-table-edit-modal"
import { getEffectiveMode } from "./data-table-filter-mode-menu"
import {
  DataTableDropToGroupZone,
  GROUP_DROPZONE_ID,
} from "./data-table-grouping"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableAlertBanner, DataTableToolbar } from "./data-table-toolbar"
import {
  EXPAND_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
} from "./display-columns"
import { ROW_ACTIONS_COLUMN_ID } from "./data-table-row-actions"
import { SUBSTRING_MODES } from "./filter-fns"
import { Highlight } from "./highlight"
import { SELECTION_COLUMN_ID } from "./selection-column"
import { DENSITY_CELL_PADDING, type DataTableInstance } from "./types"
import { useGridNavigation } from "./use-grid-navigation"

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

const ALIGN_CELL = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

const DISPLAY_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
])

// All injected (non-user) columns, used to find the first real data column so
// tree (sub-row) rows can be indented by depth there.
const NON_DATA_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
  ROW_ACTIONS_COLUMN_ID,
])

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
    showSkeletons,
    showLoadingOverlay,
    showColumnFilters,
    enableColumnFilters,
    enableFilterMatchHighlighting,
    columnsWithCustomCell,
    enableColumnOrdering,
    enableColumnResizing,
    enableRowOrdering,
    enableGrouping,
    enableStickyFooter,
    renderDetailPanel,
    enableRowVirtualization,
    enableColumnVirtualization,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    enableStickyHeader,
    enablePagination,
    positionPagination,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    enableTopToolbar,
    enableBottomToolbar,
    enableKeyboardNavigation,
    onRowOrderChange,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    renderEmpty,
    renderCaption,
    renderTopToolbar,
    renderBottomToolbar,
    renderBottomToolbarCustomActions,
    localization,
  } = table.cnTable

  const { ref: gridRef, onKeyDown } = useGridNavigation<HTMLDivElement>(
    enableKeyboardNavigation
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const padding = DENSITY_CELL_PADDING[density]
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const topRows = table.getTopRows()
  const bottomRows = table.getBottomRows()
  const centerRows = table.getCenterRows()
  const hasRows = topRows.length + centerRows.length + bottomRows.length > 0

  const leafColumnIds = table.getVisibleLeafColumns().map((c) => c.id)
  const centerRowIds = centerRows.map((r) => r.id)

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())
  const filterRowVisible =
    enableColumnFilters && showColumnFilters && anyFilterable

  // Render a footer whenever any column defines one; stickiness is separate
  // (controlled by enableStickyFooter, on by default).
  const showFooter = table
    .getAllLeafColumns()
    .some((c) => c.columnDef.footer != null)

  const columnSizing = table.getState().columnSizing
  const columnSizingInfo = table.getState().columnSizingInfo
  const columnSizeVars = React.useMemo(
    () => (enableColumnResizing ? getColumnSizeVars(table) : {}),
    // columnSizing/Info are intentional triggers: recompute vars on resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableColumnResizing, table, columnSizing, columnSizingInfo]
  )

  // While resizing, widths come from CSS vars. Otherwise honor an explicitly
  // defined `columnDef.size` (MRT behaviour) but leave unsized columns to the
  // browser's auto layout so the table still fills its container.
  const widthStyle = (column: Column<TData, unknown>): React.CSSProperties => {
    if (enableColumnResizing) return getColumnWidthStyle(column.id)
    // Column virtualization needs every column to have a concrete width.
    if (enableColumnVirtualization || column.columnDef.size != null) {
      const size = column.getSize()
      return { width: size, minWidth: size }
    }
    return {}
  }

  // One DndContext handles both column and row drags; the active item's
  // `data.type` (set in useSortable) routes to the right handler. (Two nested
  // contexts can't be used: dnd-kit renders an a11y <div> that is invalid
  // inside <tbody>, and a body-wrapping context would swallow header drags.)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const type = active.data.current?.type

    if (type === "row") {
      if (active.id !== over.id) {
        onRowOrderChange?.(active.id as string, over.id as string)
      }
      return
    }

    // column drag
    if (over.id === GROUP_DROPZONE_ID) {
      const column = table.getColumn(active.id as string)
      if (column && !column.getIsGrouped()) column.toggleGrouping()
      return
    }
    if (active.id === over.id) return
    const base =
      table.getState().columnOrder.length > 0
        ? table.getState().columnOrder
        : table.getAllLeafColumns().map((c) => c.id)
    const oldIndex = base.indexOf(active.id as string)
    const newIndex = base.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    table.setColumnOrder(arrayMove(base, oldIndex, newIndex))
  }

  // Tree data (getSubRows) indents the first real data column by row depth so
  // the hierarchy is visible (grouped rows self-indent via the group cell).
  const isTreeData = table.options.getSubRows != null
  const firstDataColumnId = table
    .getVisibleLeafColumns()
    .find((c) => !NON_DATA_COLUMN_IDS.has(c.id))?.id

  const renderCell = (
    cell: Cell<TData, unknown>,
    row: Row<TData>,
    rowIndex: number,
    colIndex: number
  ) => {
    const align = cell.column.columnDef.meta?.align ?? "left"
    const treeIndent =
      isTreeData &&
      cell.column.id === firstDataColumnId &&
      !cell.getIsGrouped() &&
      row.depth > 0
        ? row.depth
        : 0
    return (
      <TableCell
        key={cell.id}
        data-cell-row={rowIndex}
        data-cell-col={colIndex}
        data-pinned={cell.column.getIsPinned() || undefined}
        tabIndex={
          enableKeyboardNavigation
            ? rowIndex === 0 && colIndex === 0
              ? 0
              : -1
            : undefined
        }
        style={{
          ...widthStyle(cell.column),
          ...getColumnPinningStyle(cell.column),
        }}
        onClick={
          onCellClick
            ? (event) => onCellClick({ cell, row, table, event })
            : undefined
        }
        onDoubleClick={
          onCellDoubleClick
            ? (event) => onCellDoubleClick({ cell, row, table, event })
            : undefined
        }
        className={cn(
          "relative bg-background",
          padding,
          ALIGN_CELL[align],
          getColumnPinningClass(cell.column),
          enableKeyboardNavigation &&
            "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:-outline-offset-2 focus-visible:outline-none"
        )}
      >
        {treeIndent > 0 ? (
          <span
            className="flex items-center"
            style={{ paddingInlineStart: `${treeIndent}rem` }}
          >
            {renderBodyCell(
              cell,
              table,
              enableFilterMatchHighlighting,
              columnsWithCustomCell,
              localization
            )}
          </span>
        ) : (
          renderBodyCell(
            cell,
            table,
            enableFilterMatchHighlighting,
            columnsWithCustomCell,
            localization
          )
        )}
      </TableCell>
    )
  }

  const renderCells = (row: Row<TData>, rowIndex: number): React.ReactNode => {
    const cells = row.getVisibleCells()
    if (!enableColumnVirtualization) {
      return cells.map((cell, colIndex) =>
        renderCell(cell, row, rowIndex, colIndex)
      )
    }
    return withColumnSpacers(
      virtualColumns
        .map((vc) => {
          const cell = cells[vc.index]
          return cell ? renderCell(cell, row, rowIndex, vc.index) : null
        })
        .filter(Boolean) as React.ReactNode[],
      `row-${row.id}`
    )
  }

  const renderHeadCell = (header: Header<TData, unknown>) => (
    <DataTableHeadCell
      key={header.id}
      header={header}
      table={table}
      draggable={
        enableColumnOrdering &&
        !enableColumnVirtualization &&
        !DISPLAY_COLUMN_IDS.has(header.column.id) &&
        !header.column.getIsPinned()
      }
      resizable={enableColumnResizing}
      widthStyle={widthStyle(header.column)}
      padding={padding}
    >
      {header.isPlaceholder ? null : (
        <DataTableColumnHeader header={header} table={table} />
      )}
    </DataTableHeadCell>
  )

  const renderFilterCell = (header: Header<TData, unknown>) => (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      style={{
        ...widthStyle(header.column),
        ...getColumnPinningStyle(header.column),
      }}
      className={cn(
        "bg-background pt-0 pb-2",
        getColumnPinningClass(header.column)
      )}
    >
      <DataTableColumnFilter header={header} table={table} />
    </TableHead>
  )

  const detailRow = (row: Row<TData>) => (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={visibleColumnCount} className="bg-muted/20 p-0">
        <div className="p-3">{renderDetailPanel?.({ row, table })}</div>
      </TableCell>
    </TableRow>
  )

  let runningRowIndex = 0
  const renderRow = (row: Row<TData>) => {
    const rowIndex = runningRowIndex++
    const isGrouped = row.getIsGrouped()
    const showDetail = !!renderDetailPanel && row.getIsExpanded() && !isGrouped

    return (
      <React.Fragment key={row.id}>
        <DataTableBodyRow
          row={row}
          draggable={
            enableRowOrdering &&
            !enableRowVirtualization &&
            !row.getIsPinned() &&
            !isGrouped
          }
          onClick={
            onRowClick
              ? (event) => onRowClick({ row, table, event })
              : undefined
          }
          onDoubleClick={
            onRowDoubleClick
              ? (event) => onRowDoubleClick({ row, table, event })
              : undefined
          }
        >
          {renderCells(row, rowIndex)}
        </DataTableBodyRow>
        {showDetail && detailRow(row)}
      </React.Fragment>
    )
  }

  // Flatten center rows (+ expanded detail panels) into a virtualization list.
  const virtualItems: { row: Row<TData>; detail: boolean }[] = []
  if (enableRowVirtualization) {
    for (const row of centerRows) {
      virtualItems.push({ row, detail: false })
      if (renderDetailPanel && row.getIsExpanded() && !row.getIsGrouped()) {
        virtualItems.push({ row, detail: true })
      }
    }
  }

  // User-supplied passthrough options, resolved from their value-or-function form.
  const rowVOptions =
    typeof rowVirtualizerOptions === "function"
      ? rowVirtualizerOptions({ table })
      : rowVirtualizerOptions
  const columnVOptions =
    typeof columnVirtualizerOptions === "function"
      ? columnVirtualizerOptions({ table })
      : columnVirtualizerOptions

  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => table.cnTable.estimateRowHeight,
    overscan: table.cnTable.virtualOverscan,
    measureElement:
      typeof window !== "undefined"
        ? (el) => el?.getBoundingClientRect().height ?? 0
        : undefined,
    ...rowVOptions,
  })

  // Horizontal virtualizer for wide tables. When off, count is 0 and the
  // helpers below fall through to rendering all columns.
  const leafColumns = table.getVisibleLeafColumns()
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: enableColumnVirtualization ? leafColumns.length : 0,
    getScrollElement: () => gridRef.current,
    estimateSize: (index) => leafColumns[index]?.getSize() ?? 150,
    overscan: table.cnTable.virtualOverscan,
    ...columnVOptions,
  })

  // Expose the virtualizer instances for imperative control (e.g. scrollToIndex).
  React.useEffect(() => {
    if (rowVirtualizerInstanceRef) rowVirtualizerInstanceRef.current = rowVirtualizer
  })
  React.useEffect(() => {
    if (columnVirtualizerInstanceRef)
      columnVirtualizerInstanceRef.current = columnVirtualizer
  })
  const virtualColumns = enableColumnVirtualization
    ? columnVirtualizer.getVirtualItems()
    : []
  const colSpacerLeft = virtualColumns.length
    ? (virtualColumns[0]?.start ?? 0)
    : 0
  const colSpacerRight = virtualColumns.length
    ? columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
    : 0

  /** Wraps a row of cells with left/right spacers when virtualizing columns. */
  const withColumnSpacers = (
    cells: React.ReactNode[],
    keyPrefix: string
  ): React.ReactNode => {
    if (!enableColumnVirtualization) return cells
    return (
      <>
        {colSpacerLeft > 0 && (
          <td
            key={`${keyPrefix}-spacer-l`}
            aria-hidden
            style={{ width: colSpacerLeft }}
          />
        )}
        {cells}
        {colSpacerRight > 0 && (
          <td
            key={`${keyPrefix}-spacer-r`}
            aria-hidden
            style={{ width: colSpacerRight }}
          />
        )}
      </>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
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
          : enableTopToolbar && <DataTableToolbar table={table} />}
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
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {enableGrouping &&
            (positionToolbarDropZone === "top" ||
              positionToolbarDropZone === "both") && (
              <DataTableDropToGroupZone table={table} />
            )}

          <div
            ref={gridRef}
            onKeyDown={onKeyDown}
            data-slot="data-table-surface"
            className={cn(
              // This surface is the single scroll container for both axes, so
              // the sticky header/footer engage and the horizontal scrollbar
              // stays pinned to the visible bottom. Neutralize the shadcn
              // <Table> wrapper's own overflow so it doesn't become a second
              // (unbounded) scroll container that breaks sticky positioning.
              "relative overflow-auto rounded-md border [&>[data-slot=table-container]]:overflow-visible",
              enableRowVirtualization && "max-h-[600px]",
              surfaceClassName
            )}
          >
            {showProgressBars && (
              <div
                data-slot="data-table-progress"
                className="absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden bg-primary/20"
                role="presentation"
              >
                <div className="h-full w-1/3 animate-[cn-table-progress_1.1s_ease-in-out_infinite] bg-primary" />
              </div>
            )}

            <Table
              style={columnSizeVars}
              // When resizing, size to content but never below the container,
              // so columns fill the width (incl. full-screen) yet can grow to
              // scroll when their combined width exceeds it.
              className={cn(enableColumnResizing && "w-auto min-w-full")}
            >
              {renderCaption && (
                <TableCaption>{renderCaption({ table })}</TableCaption>
              )}
              <TableHeader
                className={cn(
                  enableStickyHeader && "sticky top-0 z-20 bg-background"
                )}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="group/th hover:bg-transparent"
                  >
                    {enableColumnVirtualization ? (
                      withColumnSpacers(
                        virtualColumns
                          .map((vc) => {
                            const header = headerGroup.headers[vc.index]
                            return header ? renderHeadCell(header) : null
                          })
                          .filter(Boolean) as React.ReactNode[],
                        `head-${headerGroup.id}`
                      )
                    ) : (
                      <SortableContext
                        items={leafColumnIds}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map(renderHeadCell)}
                      </SortableContext>
                    )}
                  </TableRow>
                ))}

                {filterRowVisible &&
                  table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={`${headerGroup.id}-filters`}
                      className="hover:bg-transparent"
                    >
                      {enableColumnVirtualization
                        ? withColumnSpacers(
                            virtualColumns
                              .map((vc) => {
                                const header = headerGroup.headers[vc.index]
                                return header ? renderFilterCell(header) : null
                              })
                              .filter(Boolean) as React.ReactNode[],
                            `filter-${headerGroup.id}`
                          )
                        : headerGroup.headers.map(renderFilterCell)}
                    </TableRow>
                  ))}
              </TableHeader>

              <TableBody>
                {showSkeletons && !hasRows ? (
                  <SkeletonRows
                    rowCount={
                      enablePagination
                        ? table.getState().pagination.pageSize
                        : 8
                    }
                    columnCount={visibleColumnCount}
                    padding={padding}
                  />
                ) : hasRows && enableRowVirtualization ? (
                  <>
                    {topRows.map(renderRow)}
                    {(() => {
                      const vRows = rowVirtualizer.getVirtualItems()
                      const padTop = vRows.length ? (vRows[0]?.start ?? 0) : 0
                      const padBottom = vRows.length
                        ? rowVirtualizer.getTotalSize() -
                          (vRows[vRows.length - 1]?.end ?? 0)
                        : 0
                      return (
                        <>
                          {padTop > 0 && (
                            <tr aria-hidden>
                              <td
                                colSpan={visibleColumnCount}
                                style={{
                                  height: padTop,
                                  padding: 0,
                                  border: 0,
                                }}
                              />
                            </tr>
                          )}
                          {vRows.map((vRow) => {
                            const item = virtualItems[vRow.index]
                            if (!item) return null
                            if (item.detail) {
                              return (
                                <TableRow
                                  key={`${item.row.id}-detail`}
                                  data-index={vRow.index}
                                  ref={rowVirtualizer.measureElement}
                                  className="hover:bg-transparent"
                                >
                                  <TableCell
                                    colSpan={visibleColumnCount}
                                    className="bg-muted/20 p-0"
                                  >
                                    <div className="p-3">
                                      {renderDetailPanel?.({
                                        row: item.row,
                                        table,
                                      })}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            return (
                              <TableRow
                                key={item.row.id}
                                data-index={vRow.index}
                                ref={rowVirtualizer.measureElement}
                                data-state={
                                  item.row.getIsSelected()
                                    ? "selected"
                                    : undefined
                                }
                                onClick={
                                  onRowClick
                                    ? (event) =>
                                        onRowClick({
                                          row: item.row,
                                          table,
                                          event,
                                        })
                                    : undefined
                                }
                                onDoubleClick={
                                  onRowDoubleClick
                                    ? (event) =>
                                        onRowDoubleClick({
                                          row: item.row,
                                          table,
                                          event,
                                        })
                                    : undefined
                                }
                                className={cn(
                                  "data-[state=selected]:shadow-[inset_2px_0_0_0_var(--primary)]",
                                  (onRowClick || onRowDoubleClick) &&
                                    "cursor-pointer"
                                )}
                              >
                                {renderCells(item.row, vRow.index)}
                              </TableRow>
                            )
                          })}
                          {padBottom > 0 && (
                            <tr aria-hidden>
                              <td
                                colSpan={visibleColumnCount}
                                style={{
                                  height: padBottom,
                                  padding: 0,
                                  border: 0,
                                }}
                              />
                            </tr>
                          )}
                        </>
                      )
                    })()}
                    {bottomRows.map(renderRow)}
                  </>
                ) : hasRows ? (
                  <>
                    {topRows.map(renderRow)}
                    <SortableContext
                      items={centerRowIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {centerRows.map(renderRow)}
                    </SortableContext>
                    {bottomRows.map(renderRow)}
                  </>
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="h-32 text-center text-sm text-muted-foreground"
                    >
                      {renderEmpty?.({ table }) ??
                        localization.noRecordsToDisplay}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              {showFooter && (
                <TableFooter
                  className={cn(enableStickyFooter && "sticky bottom-0 z-20")}
                >
                  {table.getFooterGroups().map((footerGroup) => {
                    const headers = enableColumnVirtualization
                      ? (virtualColumns
                          .map((vc) => footerGroup.headers[vc.index])
                          .filter(Boolean) as Header<TData, unknown>[])
                      : footerGroup.headers
                    const cells = headers.map((header) => (
                      <TableCell
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...widthStyle(header.column),
                          ...getColumnPinningStyle(header.column),
                        }}
                        className={cn(
                          padding,
                          getColumnPinningClass(header.column)
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.footer,
                              header.getContext()
                            )}
                      </TableCell>
                    ))
                    return (
                      <TableRow
                        key={footerGroup.id}
                        className="hover:bg-transparent"
                      >
                        {withColumnSpacers(cells, `footer-${footerGroup.id}`)}
                      </TableRow>
                    )
                  })}
                </TableFooter>
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

        {renderBottomToolbar
          ? renderBottomToolbar({ table })
          : enableBottomToolbar &&
            (() => {
              const customActions = renderBottomToolbarCustomActions?.({
                table,
              })
              const showBottomPagination =
                enablePagination &&
                (positionPagination === "bottom" ||
                  positionPagination === "both")
              const pagination = showBottomPagination ? (
                <DataTablePagination
                  table={table}
                  pageSizeOptions={pageSizeOptions}
                />
              ) : null
              if (customActions == null) return pagination
              return (
                <div
                  data-slot="data-table-bottom-toolbar"
                  className="flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">{customActions}</div>
                  {pagination && <div className="flex-1">{pagination}</div>}
                </div>
              )
            })()}

        <DataTableEditModal table={table} />
      </div>
    </TooltipProvider>
  )
}

function SkeletonRows({
  rowCount,
  columnCount,
  padding,
}: {
  rowCount: number
  columnCount: number
  padding: string
}) {
  return (
    <>
      {Array.from({ length: Math.max(1, rowCount) }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: Math.max(1, columnCount) }).map(
            (__, colIndex) => (
              <TableCell key={colIndex} className={padding}>
                <Skeleton className="h-4 w-full max-w-[12rem]" />
              </TableCell>
            )
          )}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Resolves a body cell's content, handling grouped / aggregated / placeholder
 * cells and falling back to the highlight-aware value renderer.
 */
function renderBodyCell<TData extends RowData>(
  cell: Cell<TData, unknown>,
  table: DataTableInstance<TData>,
  enableHighlight: boolean,
  columnsWithCustomCell: ReadonlySet<string>,
  localization: DataTableInstance<TData>["cnTable"]["localization"]
): React.ReactNode {
  const { row, column } = cell
  const icons = table.cnTable.icons
  const meta = column.columnDef.meta

  // Grouped/aggregated/placeholder cells are a grouping concept. Tree data
  // (getSubRows) also marks parent rows' cells as "aggregated", which would
  // bypass normal cell rendering (e.g. the expand chevron). Only take these
  // branches when grouping is actually active.
  const isGrouping = table.getState().grouping.length > 0

  if (isGrouping && cell.getIsGrouped()) {
    return (
      <button
        type="button"
        aria-label={localization.toggleRowExpanded}
        aria-expanded={row.getIsExpanded()}
        onClick={row.getToggleExpandedHandler()}
        style={{ paddingInlineStart: `${row.depth * 1}rem` }}
        className="flex items-center gap-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {row.getIsExpanded() ? (
          <icons.expanded className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <icons.collapsed className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="font-medium">
          {meta?.renderGroupedCell
            ? meta.renderGroupedCell({ cell, row, column, table })
            : flexRender(column.columnDef.cell, cell.getContext())}
        </span>
        <span className="text-xs text-muted-foreground">
          ({row.subRows.length})
        </span>
      </button>
    )
  }

  if (isGrouping && cell.getIsAggregated()) {
    if (meta?.renderAggregatedCell) {
      return meta.renderAggregatedCell({ cell, row, column, table })
    }
    return flexRender(
      column.columnDef.aggregatedCell ?? column.columnDef.cell,
      cell.getContext()
    )
  }

  if (isGrouping && cell.getIsPlaceholder()) {
    return meta?.renderPlaceholderCell
      ? meta.renderPlaceholderCell({ cell, row, column, table })
      : null
  }

  return (
    <DataTableBodyCellContent
      cell={cell}
      table={table}
      fallback={renderCellContent(
        cell,
        table,
        enableHighlight,
        columnsWithCustomCell
      )}
    />
  )
}

/**
 * Renders a cell's value, auto-highlighting matched substrings for columns with
 * no custom cell renderer and an active string substring filter / global query.
 */
function renderCellContent<TData extends RowData>(
  cell: Cell<TData, unknown>,
  table: DataTableInstance<TData>,
  enableHighlight: boolean,
  columnsWithCustomCell: ReadonlySet<string>
): React.ReactNode {
  const { column } = cell
  const value = cell.getValue()
  const canHighlight =
    enableHighlight &&
    !column.columnDef.meta?.disableHighlight &&
    !columnsWithCustomCell.has(column.id) &&
    (typeof value === "string" || typeof value === "number")

  if (canHighlight) {
    const query = resolveHighlightQuery(cell, table)
    if (query) {
      return <Highlight text={String(value)} query={query} />
    }
  }

  return flexRender(column.columnDef.cell, cell.getContext())
}

/** The active highlight query for a cell: its column filter, else global search. */
function resolveHighlightQuery<TData extends RowData>(
  cell: Cell<TData, unknown>,
  table: DataTableInstance<TData>
): string | null {
  const filterValue = cell.column.getFilterValue()
  if (
    typeof filterValue === "string" &&
    filterValue.length > 0 &&
    SUBSTRING_MODES.has(getEffectiveMode(cell.column, table))
  ) {
    return filterValue
  }
  const globalFilter = table.getState().globalFilter
  if (
    typeof globalFilter === "string" &&
    globalFilter.length > 0 &&
    SUBSTRING_MODES.has(table.cnTable.globalFilterMode)
  ) {
    return globalFilter
  }
  return null
}
