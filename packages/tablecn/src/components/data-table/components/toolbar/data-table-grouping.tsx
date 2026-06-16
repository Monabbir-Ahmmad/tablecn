"use client"

import type { RowData } from "@tanstack/react-table"
import { useDroppable } from "@dnd-kit/core"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { getColumnLabel } from "../../helpers/column-label"
import type { DataTableInstance } from "../../core/types"

export const GROUP_DROPZONE_ID = "cn-group-dropzone"

/**
 * The MRT "drop to group by" zone: a dashed strip below the toolbar showing
 * chips for the active grouping columns (each removable) and acting as a drop
 * target for column drags (handled by the column DnD context in `<DataTable>`).
 */
export function DataTableDropToGroupZone<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons } = table.cnTable
  const grouping = table.getState().grouping
  const { setNodeRef, isOver } = useDroppable({ id: GROUP_DROPZONE_ID })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors",
        isOver && "border-primary bg-muted text-foreground"
      )}
    >
      <icons.group className="size-3.5 shrink-0" />
      {grouping.length === 0 ? (
        <span>{localization.dropToGroupBy}</span>
      ) : (
        grouping.map((columnId) => {
          const column = table.getColumn(columnId)
          if (!column) return null
          return (
            <Badge
              key={columnId}
              variant="secondary"
              className="gap-1 rounded-sm pr-1 normal-case"
            >
              {getColumnLabel(column)}
              <button
                type="button"
                aria-label={localization.ungroupByColumn(
                  getColumnLabel(column)
                )}
                onClick={() => column.toggleGrouping()}
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <icons.clear className="size-3" />
              </button>
            </Badge>
          )
        })
      )}
    </div>
  )
}
