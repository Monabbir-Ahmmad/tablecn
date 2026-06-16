"use client"

import * as React from "react"
import type { Row, RowData } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { RowDragContext } from "../../../display-columns/display-columns"

/**
 * Body row. `useSortable` is always called (disabled when row ordering is off).
 * Exposes its drag-handle props through {@link RowDragContext} so the drag
 * column's handle can activate it. Applies the selected-row accent.
 */
export function DataTableBodyRow<TData extends RowData>({
  row,
  draggable,
  children,
  className,
  onClick,
  onDoubleClick,
}: {
  row: Row<TData>
  draggable: boolean
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  onDoubleClick?: React.MouseEventHandler<HTMLTableRowElement>
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id, disabled: !draggable, data: { type: "row" } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  const dragProps = React.useMemo(
    () => ({
      attributes: attributes as unknown as Record<string, unknown>,
      listeners: listeners as Record<string, unknown> | undefined,
      setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  )

  return (
    <RowDragContext.Provider value={dragProps}>
      <TableRow
        ref={setNodeRef}
        style={style}
        data-state={row.getIsSelected() ? "selected" : undefined}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          "data-[state=selected]:shadow-[inset_2px_0_0_0_var(--primary)]",
          isDragging && "bg-muted",
          (onClick || onDoubleClick) && "cursor-pointer",
          className
        )}
      >
        {children}
      </TableRow>
    </RowDragContext.Provider>
  )
}
