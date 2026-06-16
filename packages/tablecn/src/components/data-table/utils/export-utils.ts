import type { Column, Row, RowData } from "@tanstack/react-table"
import Papa from "papaparse"
import * as XLSX from "xlsx"

import { getColumnLabel } from "../helpers/column-label"
import { EXPAND_COLUMN_ID, ROW_DRAG_COLUMN_ID, ROW_NUMBER_COLUMN_ID } from "../display-columns/display-columns"
import { ROW_ACTIONS_COLUMN_ID } from "../display-columns/data-table-row-actions"
import { SELECTION_COLUMN_ID } from "../display-columns/selection-column"
import type { DataTableInstance } from "../core/types"

const NON_DATA_COLUMNS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
  ROW_ACTIONS_COLUMN_ID,
])

/** Which rows to export. */
export type ExportScope = "selected" | "filtered" | "all" | "page"

export interface ExportOptions {
  fileName?: string
  /** Defaults to "selected" when rows are selected, else "filtered". */
  scope?: ExportScope
}

/** Data columns suitable for export (excludes the injected display columns). */
export function getExportableColumns<TData extends RowData>(
  table: DataTableInstance<TData>
): Column<TData, unknown>[] {
  return table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn != null && !NON_DATA_COLUMNS.has(column.id))
}

function resolveRows<TData extends RowData>(
  table: DataTableInstance<TData>,
  scope: ExportScope
): Row<TData>[] {
  switch (scope) {
    case "selected":
      return table.getSelectedRowModel().rows
    case "page":
      return table.getRowModel().rows
    case "all":
      return table.getPreFilteredRowModel().rows
    default:
      return table.getFilteredRowModel().rows
  }
}

function effectiveScope<TData extends RowData>(
  table: DataTableInstance<TData>,
  scope?: ExportScope
): ExportScope {
  if (scope) return scope
  return table.getSelectedRowModel().rows.length > 0 ? "selected" : "filtered"
}

/** Builds an array-of-arrays: [header labels, ...data rows] of raw values. */
export function toAOA<TData extends RowData>(
  table: DataTableInstance<TData>,
  scope: ExportScope
): (string | number | boolean | null)[][] {
  const columns = getExportableColumns(table)
  const header = columns.map((column) => getColumnLabel(column))
  const rows = resolveRows(table, scope).map((row) =>
    columns.map((column) => normalize(row.getValue(column.id)))
  )
  return [header, ...rows]
}

function normalize(value: unknown): string | number | boolean | null {
  if (value == null) return null
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value
  }
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

/** Export to CSV via PapaParse + a Blob download. */
export function exportToCsv<TData extends RowData>(
  table: DataTableInstance<TData>,
  options: ExportOptions = {}
): void {
  const scope = effectiveScope(table, options.scope)
  const aoa = toAOA(table, scope)
  const csv = Papa.unparse(aoa)
  // Prepend a UTF-8 BOM so Excel detects the encoding.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, `${options.fileName ?? "export"}.csv`)
}

/** Export to an .xlsx worksheet via SheetJS. */
export function exportToExcel<TData extends RowData>(
  table: DataTableInstance<TData>,
  options: ExportOptions = {}
): void {
  const scope = effectiveScope(table, options.scope)
  const aoa = toAOA(table, scope)
  const worksheet = XLSX.utils.aoa_to_sheet(aoa)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  XLSX.writeFile(workbook, `${options.fileName ?? "export"}.xlsx`)
}

function triggerDownload(blob: Blob, fileName: string): void {
  if (typeof document === "undefined") return
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
