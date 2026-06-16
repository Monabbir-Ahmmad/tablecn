"use client"

import type * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { DataTableExportMenu } from "../menus/data-table-export-menu"
import { DataTableGlobalFilter } from "./data-table-global-filter"
import {
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from "./controls"
import { DataTableViewOptions } from "./data-table-view-options"
import type { DataTableInstance } from "../../core/types"

/**
 * Top toolbar. Left region: title slot + consumer toolbar actions. Right
 * region: the MRT-ordered icon cluster (global search → filters funnel →
 * column visibility → density → full screen).
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  toolbarRef,
  searchInputRef,
}: {
  table: DataTableInstance<TData>
  /** Optional ref forwarded to the toolbar root. Defaults to the instance's
   *  `topToolbarRef` when rendered by `DataTable`. */
  toolbarRef?: React.Ref<HTMLDivElement>
  /** Optional ref forwarded to the global-search input. Defaults to the
   *  instance's `searchInputRef` when rendered by `DataTable`. */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const {
    title,
    renderToolbarActions,
    renderToolbarInternalActions,
    enableToolbarInternalActions,
    enableGlobalFilter,
    positionGlobalFilter,
    enableColumnFilters,
    columnFilterDisplayMode,
    enableColumnActions,
    enableExport,
    enableDensityToggle,
    enableFullscreenToggle,
    exportFileName,
  } = table.cnTable

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())

  const showGlobalFilter = enableGlobalFilter && positionGlobalFilter !== "none"

  return (
    <div
      ref={toolbarRef}
      data-slot="data-table-toolbar"
      className="flex items-start justify-between gap-3 py-1"
    >
      <div className="flex min-h-9 flex-1 flex-wrap items-center gap-2">
        {showGlobalFilter && positionGlobalFilter === "left" && (
          <DataTableGlobalFilter table={table} searchInputRef={searchInputRef} />
        )}
        {title != null && (
          <div className="text-sm font-semibold tracking-wide">{title}</div>
        )}
        {renderToolbarActions?.({ table })}
      </div>

      {enableToolbarInternalActions && (
        <div
          data-slot="data-table-toolbar-actions"
          className="flex shrink-0 items-center gap-1.5"
        >
          {renderToolbarInternalActions ? (
            renderToolbarInternalActions({ table })
          ) : (
            <>
              {showGlobalFilter && positionGlobalFilter === "right" && (
                <DataTableGlobalFilter
                  table={table}
                  searchInputRef={searchInputRef}
                />
              )}
              {enableColumnFilters &&
                anyFilterable &&
                columnFilterDisplayMode === "subheader" && (
                  <DataTableFilterToggle table={table} />
                )}
              {enableColumnActions && <DataTableViewOptions table={table} />}
              {enableExport && (
                <DataTableExportMenu table={table} fileName={exportFileName} />
              )}
              {enableDensityToggle && <DataTableDensityToggle table={table} />}
              {enableFullscreenToggle && (
                <DataTableFullscreenToggle table={table} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
