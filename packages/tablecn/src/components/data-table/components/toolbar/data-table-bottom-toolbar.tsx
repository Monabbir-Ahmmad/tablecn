"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../core/types"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableBottomToolbarProps<TData extends RowData> {
  table: DataTableInstance<TData>
  pageSizeOptions?: number[]
}

/**
 * The bottom toolbar region. Honors a `renderBottomToolbar` override; otherwise
 * lays out optional custom actions alongside the bottom pagination control,
 * rendering nothing when neither is present.
 */
export function DataTableBottomToolbar<TData extends RowData>({
  table,
  pageSizeOptions,
}: DataTableBottomToolbarProps<TData>) {
  const {
    enableBottomToolbar,
    enablePagination,
    positionPagination,
    renderBottomToolbar,
    renderBottomToolbarCustomActions,
    refs,
  } = table.cnTable

  if (renderBottomToolbar) return <>{renderBottomToolbar({ table })}</>
  if (!enableBottomToolbar) return null

  const customActions = renderBottomToolbarCustomActions?.({ table })
  const showBottomPagination =
    enablePagination &&
    (positionPagination === "bottom" || positionPagination === "both")
  const pagination = showBottomPagination ? (
    <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
  ) : null

  if (customActions == null && pagination == null) return null

  return (
    <div
      ref={refs.bottomToolbarRef}
      data-slot="data-table-bottom-toolbar"
      className={cn(
        customActions != null &&
          "flex flex-wrap items-center justify-between gap-4"
      )}
    >
      {customActions != null ? (
        <>
          <div className="flex items-center gap-2">{customActions}</div>
          {pagination && <div className="flex-1">{pagination}</div>}
        </>
      ) : (
        pagination
      )}
    </div>
  )
}
