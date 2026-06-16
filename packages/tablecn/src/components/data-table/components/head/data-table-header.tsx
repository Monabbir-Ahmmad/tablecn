"use client"

import * as React from "react"
import type { Header, RowData } from "@tanstack/react-table"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { VirtualItem } from "@tanstack/react-virtual"

import {
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import { DENSITY_CELL_PADDING, DISPLAY_COLUMN_IDS } from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import type { WithColumnSpacers } from "../../hooks/use-table-virtualizers"
import { DataTableHeadCell } from "../body/dnd"
import { DataTableColumnFilter } from "./data-table-column-filter"
import { DataTableColumnHeader } from "./data-table-column-header"

interface DataTableHeaderProps<TData extends RowData> {
  table: DataTableInstance<TData>
  virtualColumns: VirtualItem[]
  withColumnSpacers: WithColumnSpacers
}

/**
 * The table `<thead>`: the (optionally sticky) header-group rows and, when
 * enabled, the per-column filter subheader row. Honors column virtualization,
 * ordering (drag handles), pinning, and resizing.
 */
export function DataTableHeader<TData extends RowData>({
  table,
  virtualColumns,
  withColumnSpacers,
}: DataTableHeaderProps<TData>) {
  const {
    density,
    enableColumnOrdering,
    enableColumnResizing,
    enableColumnVirtualization,
    enableColumnFilters,
    showColumnFilters,
    columnFilterDisplayMode,
    enableStickyHeader,
    refs,
  } = table.cnTable

  const padding = DENSITY_CELL_PADDING[density]
  const leafColumnIds = table.getVisibleLeafColumns().map((c) => c.id)

  const anyFilterable = table
    .getAllColumns()
    .some((column) => column.getCanFilter())
  const filterRowVisible =
    enableColumnFilters &&
    showColumnFilters &&
    anyFilterable &&
    columnFilterDisplayMode === "subheader"

  const renderHeadCell = (header: Header<TData, unknown>) => (
    <DataTableHeadCell
      key={header.id}
      header={header}
      table={table}
      draggable={
        enableColumnOrdering &&
        !enableColumnVirtualization &&
        !DISPLAY_COLUMN_IDS.has(header.column.id) &&
        !header.column.getIsPinned()
      }
      resizable={enableColumnResizing}
      widthStyle={getWidthStyle(header.column, table)}
      padding={padding}
    >
      {header.isPlaceholder ? null : (
        <DataTableColumnHeader header={header} table={table} />
      )}
    </DataTableHeadCell>
  )

  const renderFilterCell = (header: Header<TData, unknown>) => (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      style={{
        ...getWidthStyle(header.column, table),
        ...getColumnPinningStyle(header.column),
      }}
      className={cn(
        "bg-background pt-0 pb-2",
        getColumnPinningClass(header.column)
      )}
    >
      <DataTableColumnFilter header={header} table={table} />
    </TableHead>
  )

  return (
    <TableHeader
      ref={refs.tableHeadRef}
      className={cn(enableStickyHeader && "sticky top-0 z-20 bg-background")}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="group/th hover:bg-transparent"
        >
          {enableColumnVirtualization ? (
            withColumnSpacers(
              virtualColumns
                .map((vc) => {
                  const header = headerGroup.headers[vc.index]
                  return header ? renderHeadCell(header) : null
                })
                .filter(Boolean) as React.ReactNode[],
              `head-${headerGroup.id}`
            )
          ) : (
            <SortableContext
              items={leafColumnIds}
              strategy={horizontalListSortingStrategy}
            >
              {headerGroup.headers.map(renderHeadCell)}
            </SortableContext>
          )}
        </TableRow>
      ))}

      {filterRowVisible &&
        table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={`${headerGroup.id}-filters`}
            className="hover:bg-transparent"
          >
            {enableColumnVirtualization
              ? withColumnSpacers(
                  virtualColumns
                    .map((vc) => {
                      const header = headerGroup.headers[vc.index]
                      return header ? renderFilterCell(header) : null
                    })
                    .filter(Boolean) as React.ReactNode[],
                  `filter-${headerGroup.id}`
                )
              : headerGroup.headers.map(renderFilterCell)}
          </TableRow>
        ))}
    </TableHeader>
  )
}
