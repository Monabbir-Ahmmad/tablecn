"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"

export const EXPAND_COLUMN_ID = "cn-expand"

/** Expand/collapse column for detail panels and tree (sub-row) expansion. */
export function createExpandColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: EXPAND_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { disableColumnActions: true },
    header: ({ table }) =>
      table.getCanSomeRowsExpand() ? (
        <button
          type="button"
          aria-label={localization.expandAll}
          onClick={table.getToggleAllRowsExpandedHandler()}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {table.getIsAllRowsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4" />
          )}
        </button>
      ) : null,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null
      return (
        <button
          type="button"
          aria-label={localization.toggleRowExpanded}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
          className="flex items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {row.getIsExpanded() ? (
            <icons.expanded className="size-4" />
          ) : (
            <icons.collapsed className="size-4" />
          )}
        </button>
      )
    },
  }
}
