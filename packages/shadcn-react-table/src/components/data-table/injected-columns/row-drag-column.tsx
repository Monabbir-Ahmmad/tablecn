"use client"

import * as React from "react"
import type { ColumnDef, RowData } from "@tanstack/react-table"

import type { DataTableIcons, IconComponent } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"

export const ROW_DRAG_COLUMN_ID = "cn-row-drag"

/** dnd-kit activator props for the current row's drag handle. */
export interface RowDragHandleProps {
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
  setActivatorNodeRef: (el: HTMLElement | null) => void
}

export const RowDragContext = React.createContext<RowDragHandleProps | null>(
  null
)

/** Drag-handle column for row ordering. The handle reads dnd-kit props from
 *  {@link RowDragContext}, set by the sortable row wrapper. */
export function createRowDragHandleColumn<TData extends RowData>(
  localization: DataTableLocalization,
  icons: DataTableIcons
): ColumnDef<TData> {
  return {
    id: ROW_DRAG_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    meta: { disableColumnActions: true, align: "center" },
    header: () => null,
    cell: () => (
      <RowDragHandle label={localization.reorderRow} Icon={icons.dragHandle} />
    ),
  }
}

function RowDragHandle({
  label,
  Icon,
}: {
  label: string
  Icon: IconComponent
}) {
  const ctx = React.useContext(RowDragContext)
  return (
    <button
      type="button"
      aria-label={label}
      ref={ctx?.setActivatorNodeRef}
      suppressHydrationWarning
      {...(ctx?.attributes ?? {})}
      {...(ctx?.listeners ?? {})}
      // touch-none/select-none: let dnd-kit's pointer sensor own the touch
      // gesture (otherwise the browser scrolls/selects text before a drag can
      // start on a phone).
      className="flex cursor-grab touch-none items-center justify-center text-muted-foreground transition-colors outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 active:cursor-grabbing"
    >
      <Icon className="size-4" />
    </button>
  )
}
