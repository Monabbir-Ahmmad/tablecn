import type { Column, RowData } from "@tanstack/react-table"

/** A column is editable when it has an accessor and isn't opted out via meta. */
export function isColumnEditable<TData extends RowData, TValue>(
  column: Column<TData, TValue>
): boolean {
  return (
    column.accessorFn != null && column.columnDef.meta?.enableEditing !== false
  )
}
