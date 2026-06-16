"use client"

import * as React from "react"
import type { Cell, RowData } from "@tanstack/react-table"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"

import { ClickToCopy } from "../body/click-to-copy"
import { getColumnLabel } from "../../helpers/column-label"
import { isColumnEditable } from "../../helpers/is-column-editable"
import { DataTableEditField } from "./data-table-edit-field"
import type { DataTableInstance } from "../../core/types"

/**
 * Resolves a leaf data cell's interactive content: an inline editor when this
 * cell/row is being edited (cell/row/table modes), otherwise the value wrapped
 * with click-to-copy, click-to-edit (cell mode), and/or a cell-actions context
 * menu as configured. `fallback` is the normal rendered value.
 */
export function DataTableBodyCellContent<TData extends RowData>({
  cell,
  table,
  fallback,
}: {
  cell: Cell<TData, unknown>
  table: DataTableInstance<TData>
  fallback: React.ReactNode
}) {
  const cn = table.cnTable
  const { row, column } = cell
  const editable = cn.enableEditing && isColumnEditable(column)
  const mode = cn.editDisplayMode

  const isCellEditing =
    mode === "cell" &&
    cn.editingCell?.rowId === row.id &&
    cn.editingCell?.columnId === column.id
  const isRowEditing = mode === "row" && cn.editingRowId === row.id
  const isTableEditing = mode === "table"

  if (editable && (isCellEditing || isRowEditing || isTableEditing)) {
    const renderEditCell = column.columnDef.meta?.renderEditCell
    if (renderEditCell) {
      return renderEditCell({ cell, row, column, table })
    }
    return mode === "row" ? (
      <RowDraftEditor cell={cell} table={table} />
    ) : (
      <LocalDraftEditor
        cell={cell}
        table={table}
        exitOnCommit={mode === "cell"}
      />
    )
  }

  let node: React.ReactNode = fallback

  const copyEnabled =
    column.columnDef.meta?.enableClickToCopy ?? cn.enableClickToCopy
  if (copyEnabled) {
    node = (
      <ClickToCopy
        value={String(cell.getValue() ?? "")}
        copyLabel={cn.localization.copy}
        copiedLabel={cn.localization.copied}
      >
        {node}
      </ClickToCopy>
    )
  } else if (editable && mode === "cell") {
    node = (
      <button
        type="button"
        onClick={() =>
          cn.setEditingCell({ rowId: row.id, columnId: column.id })
        }
        className="-mx-1 w-full rounded-sm px-1 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {node}
      </button>
    )
  }

  if (cn.renderCellActionMenuItems) {
    node = (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <span className="block">{node}</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {cn.renderCellActionMenuItems({ cell, row, table })}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return node
}

/** Editor bound to the shared row draft (row/modal editing). */
function RowDraftEditor<TData extends RowData>({
  cell,
  table,
}: {
  cell: Cell<TData, unknown>
  table: DataTableInstance<TData>
}) {
  const cn = table.cnTable
  const { column } = cell
  const meta = column.columnDef.meta
  const value =
    column.id in cn.rowDraft ? cn.rowDraft[column.id] : cell.getValue()
  const error = meta?.validate?.(value)
  return (
    <DataTableEditField
      value={value}
      variant={meta?.editVariant}
      options={meta?.editSelectOptions ?? meta?.options}
      error={error}
      ariaLabel={getColumnLabel(column)}
      onChange={(next) => cn.setRowDraftValue(column.id, next)}
    />
  )
}

/** Editor with local draft state (cell + table editing). */
function LocalDraftEditor<TData extends RowData>({
  cell,
  table,
  exitOnCommit,
}: {
  cell: Cell<TData, unknown>
  table: DataTableInstance<TData>
  exitOnCommit: boolean
}) {
  const cn = table.cnTable
  const { row, column } = cell
  const meta = column.columnDef.meta
  const [draft, setDraft] = React.useState<unknown>(() => cell.getValue())
  const error = meta?.validate?.(draft)

  const commit = () => {
    if (error) return
    if (draft !== cell.getValue()) {
      cn.onEditCellSave?.({ row, column, value: draft, table })
    }
    if (exitOnCommit) cn.setEditingCell(null)
  }

  const cancel = () => {
    setDraft(cell.getValue())
    if (exitOnCommit) cn.setEditingCell(null)
  }

  return (
    <DataTableEditField
      value={draft}
      variant={meta?.editVariant}
      options={meta?.editSelectOptions ?? meta?.options}
      error={error}
      ariaLabel={getColumnLabel(column)}
      autoFocus={exitOnCommit}
      onChange={setDraft}
      onCommit={commit}
      onCancel={cancel}
    />
  )
}
