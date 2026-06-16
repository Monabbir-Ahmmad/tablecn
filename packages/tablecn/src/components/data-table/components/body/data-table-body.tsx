"use client"

import * as React from "react"
import {
  type Cell,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { Virtualizer } from "@tanstack/react-virtual"

import {
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import {
  ALIGN_CELL,
  DENSITY_CELL_PADDING,
  NON_DATA_COLUMN_IDS,
} from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import type {
  VirtualRowItem,
  WithColumnSpacers,
} from "../../hooks/use-table-virtualizers"
import { DataTableBodyRow } from "./dnd"
import { DataTableCreateRow } from "../editing/data-table-create-row"
import { renderBodyCell } from "./render-body-cell"
import { SkeletonRows } from "./skeleton-rows"

interface DataTableBodyProps<TData extends RowData> {
  table: DataTableInstance<TData>
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
  virtualItems: VirtualRowItem<TData>[]
  virtualColumns: { index: number }[]
  withColumnSpacers: WithColumnSpacers
}

/**
 * The table `<tbody>`: the optional inline create-row, then either skeleton
 * rows (initial load), the virtualized window, the normal (sortable) rows, or
 * the empty-state row. Owns per-row / per-cell rendering, tree indentation, and
 * expanded detail panels.
 */
export function DataTableBody<TData extends RowData>({
  table,
  rowVirtualizer,
  virtualItems,
  virtualColumns,
  withColumnSpacers,
}: DataTableBodyProps<TData>) {
  const {
    density,
    enableKeyboardNavigation,
    enableFilterMatchHighlighting,
    columnsWithCustomCell,
    enableColumnVirtualization,
    enableRowVirtualization,
    enableRowOrdering,
    renderDetailPanel,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    renderEmpty,
    enablePagination,
    showSkeletons,
    localization,
  } = table.cnTable

  const padding = DENSITY_CELL_PADDING[density]
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const topRows = table.getTopRows()
  const bottomRows = table.getBottomRows()
  const centerRows = table.getCenterRows()
  const hasRows = topRows.length + centerRows.length + bottomRows.length > 0
  const centerRowIds = centerRows.map((r) => r.id)

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
          ...getWidthStyle(cell.column, table),
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
            onRowClick ? (event) => onRowClick({ row, table, event }) : undefined
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

  return (
    <TableBody>
      {table.cnTable.enableEditing &&
        table.cnTable.isCreating &&
        table.cnTable.createDisplayMode === "row" && (
          <DataTableCreateRow table={table} />
        )}
      {showSkeletons && !hasRows ? (
        <SkeletonRows
          rowCount={
            enablePagination ? table.getState().pagination.pageSize : 8
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
                      style={{ height: padTop, padding: 0, border: 0 }}
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
                            {renderDetailPanel?.({ row: item.row, table })}
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
                        item.row.getIsSelected() ? "selected" : undefined
                      }
                      onClick={
                        onRowClick
                          ? (event) =>
                              onRowClick({ row: item.row, table, event })
                          : undefined
                      }
                      onDoubleClick={
                        onRowDoubleClick
                          ? (event) =>
                              onRowDoubleClick({ row: item.row, table, event })
                          : undefined
                      }
                      className={cn(
                        "data-[state=selected]:shadow-[inset_2px_0_0_0_var(--primary)]",
                        (onRowClick || onRowDoubleClick) && "cursor-pointer"
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
                      style={{ height: padBottom, padding: 0, border: 0 }}
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
            {renderEmpty?.({ table }) ?? localization.noRecordsToDisplay}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}
