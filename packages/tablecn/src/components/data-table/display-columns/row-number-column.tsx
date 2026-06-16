"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"

export const ROW_NUMBER_COLUMN_ID = "cn-row-number"

/** Row-number column. `static` numbers track the current view (page-aware);
 *  `original` uses the stable source index. Optionally shows a pin toggle. */
export function createRowNumberColumn<TData extends RowData>(
  localization: DataTableLocalization,
  mode: "static" | "original",
  enableRowPinning: boolean,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: ROW_NUMBER_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 56,
    minSize: 48,
    meta: { disableColumnActions: true, align: "center", label: "#" },
    header: () => <span className="text-muted-foreground">#</span>,
    cell: ({ row, table }) => {
      const number =
        mode === "original"
          ? row.index + 1
          : table.getRowModel().rows.indexOf(row) +
            1 +
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize

      if (!enableRowPinning) {
        return (
          <span className="text-xs tabular-nums text-muted-foreground">
            {number}
          </span>
        )
      }

      const pinned = row.getIsPinned()
      return (
        <span className="group/rownum relative flex items-center justify-center">
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              "group-hover/rownum:opacity-0"
            )}
          >
            {number}
          </span>
          <button
            type="button"
            aria-label={pinned ? localization.unpinRow : localization.pinRow}
            onClick={() => row.pin(pinned ? false : "top")}
            className={cn(
              "absolute inset-0 flex items-center justify-center text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/rownum:opacity-100",
              pinned && "text-primary opacity-100"
            )}
          >
            {pinned ? (
              <icons.pinnedRow className="size-3.5" />
            ) : (
              <icons.pin className="size-3.5" />
            )}
          </button>
        </span>
      )
    },
  }
}
