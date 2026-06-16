"use client"

import type { RowData } from "@tanstack/react-table"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance } from "../../core/types"

/**
 * Selection alert banner shown between the toolbar and the table when any rows
 * are selected: a muted strip with the localized count and a Clear action.
 */
export function DataTableAlertBanner<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, enableRowSelection } = table.cnTable
  if (!enableRowSelection) return null

  const selectedCount = table.getSelectedRowModel().rows.length
  if (selectedCount === 0) return null

  const totalCount = table.getPrePaginationRowModel().rows.length

  return (
    <div
      data-slot="data-table-alert-banner"
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"
      )}
      role="status"
    >
      <span>{localization.rowsSelected(selectedCount, totalCount)}</span>
      <button
        type="button"
        onClick={() => table.resetRowSelection()}
        className="font-semibold tracking-wide text-foreground underline-offset-4 hover:underline"
      >
        {localization.clearSelection}
      </button>
    </div>
  )
}
