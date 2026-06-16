"use client"

import * as React from "react"
import { flexRender, type Cell, type RowData } from "@tanstack/react-table"

import { SUBSTRING_MODES } from "../../fns/filter-fns"
import { getEffectiveMode } from "../../helpers/effective-filter-mode"
import { DataTableBodyCellContent } from "../editing/data-table-edit-cell"
import { Highlight } from "./highlight"
import type { DataTableInstance } from "../../core/types"

/**
 * Resolves a body cell's content, handling grouped / aggregated / placeholder
 * cells and falling back to the highlight-aware value renderer.
 */
export function renderBodyCell<TData extends RowData>(
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
