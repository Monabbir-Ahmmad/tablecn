"use client"

import type { Column, RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import { TableCell, TableRow } from "@workspace/ui/components/table"

import { getColumnLabel } from "../../helpers/column-label"
import { isColumnEditable } from "../../helpers/is-column-editable"
import { DataTableEditField } from "./data-table-edit-field"
import type { DataTableInstance } from "../../core/types"

/**
 * Inline create row for `createDisplayMode: "row"`. Renders an editor per
 * editable column bound to the shared `rowDraft`, with Save/Cancel in a
 * full-width action strip beneath it. Save commits via `onCreateRow`.
 */
export function DataTableCreateRow<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const {
    enableEditing,
    rowDraft,
    onCreateRow,
    cancelEdit,
    localization,
  } = table.cnTable

  const leafColumns = table.getVisibleLeafColumns()
  const editableColumns = leafColumns.filter(
    (column) => enableEditing && isColumnEditable(column)
  )
  const hasErrors = editableColumns.some(
    (column) => column.columnDef.meta?.validate?.(rowDraft[column.id]) != null
  )

  const submit = () => {
    if (hasErrors) return
    onCreateRow?.({ values: rowDraft, table, exit: cancelEdit })
  }

  return (
    <>
      <TableRow
        data-slot="data-table-create-row"
        className="bg-muted/30 align-top hover:bg-muted/30"
      >
        {leafColumns.map((column) => {
          const editable = enableEditing && isColumnEditable(column)
          return (
            <TableCell key={column.id} className="p-2 align-top">
              {editable ? <CreateField column={column} table={table} /> : null}
            </TableCell>
          )
        })}
      </TableRow>
      <TableRow className="border-b-2 bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={leafColumns.length} className="p-2">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              {localization.cancel}
            </Button>
            <Button size="sm" onClick={submit} disabled={hasErrors}>
              {localization.save}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}

/** One editor in the create row, bound to the shared row draft. */
function CreateField<TData extends RowData>({
  column,
  table,
}: {
  column: Column<TData, unknown>
  table: DataTableInstance<TData>
}) {
  const cn = table.cnTable
  const meta = column.columnDef.meta
  const value = cn.rowDraft[column.id]
  return (
    <DataTableEditField
      value={value}
      variant={meta?.editVariant}
      options={meta?.editSelectOptions ?? meta?.options}
      error={meta?.validate?.(value)}
      ariaLabel={getColumnLabel(column)}
      onChange={(next) => cn.setRowDraftValue(column.id, next)}
    />
  )
}
