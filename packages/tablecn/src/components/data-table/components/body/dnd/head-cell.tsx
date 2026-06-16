"use client"

import * as React from "react"
import type { Header, RowData } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { TableHead } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
} from "../../../utils/column-styles"
import type { DataTableInstance } from "../../../core/types"
import { ColumnResizeHandle } from "./column-resize-handle"

/**
 * Header cell. `useSortable` is always called (disabled when ordering is off or
 * for display columns) to keep hook order stable. Applies pinning + width
 * styles, an optional drag grip, and the resize handle.
 */
export function DataTableHeadCell<TData extends RowData, TValue>({
  header,
  table,
  draggable,
  resizable,
  widthStyle,
  padding,
  children,
}: {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
  draggable: boolean
  resizable: boolean
  widthStyle: React.CSSProperties
  padding: string
  children: React.ReactNode
}) {
  const column = header.column
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useSortable({ id: column.id, disabled: !draggable, data: { type: "column" } })

  const style: React.CSSProperties = {
    ...widthStyle,
    ...getColumnPinningStyle(column),
    transform: CSS.Translate.toString(transform),
    transition: "width 0.15s ease",
    opacity: isDragging ? 0.7 : undefined,
    zIndex: isDragging ? 30 : undefined,
  }

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={style}
      data-pinned={column.getIsPinned() || undefined}
      aria-sort={ariaSort(column.getIsSorted())}
      className={cn(
        "relative bg-background",
        padding,
        getColumnPinningClass(column)
      )}
    >
      <div className="flex items-center gap-0.5">
        {draggable && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={table.cnTable.localization.reorderColumn}
            // dnd-kit injects an aria-describedby id that can differ between the
            // server and client render; suppress that benign attribute mismatch.
            suppressHydrationWarning
            className="-ml-1 flex cursor-grab items-center text-muted-foreground opacity-70 transition-opacity outline-none group-hover/th:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <table.cnTable.icons.dragHandle className="size-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {resizable && <ColumnResizeHandle header={header} table={table} />}
    </TableHead>
  )
}

function ariaSort(
  sorted: false | "asc" | "desc"
): React.AriaAttributes["aria-sort"] {
  if (sorted === "asc") return "ascending"
  if (sorted === "desc") return "descending"
  return "none"
}
