"use client"

import type { Header, RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../../core/types"

/** Drag handle to grab the resize edge of a column header. */
export function ColumnResizeHandle<TData extends RowData, TValue>({
  header,
  table,
}: {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
}) {
  if (!header.column.getCanResize()) return null
  return (
    <span
      role="separator"
      aria-label={table.cnTable.localization.resizeColumn}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() => header.column.resetSize()}
      className={cn(
        "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none select-none bg-transparent transition-colors hover:bg-border",
        header.column.getIsResizing() && "bg-primary"
      )}
    />
  )
}
