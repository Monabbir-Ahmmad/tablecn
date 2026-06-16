"use client"

import { flexRender, type Header, type RowData } from "@tanstack/react-table"
import type { VirtualItem } from "@tanstack/react-virtual"

import {
  TableCell,
  TableFooter,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import { DENSITY_CELL_PADDING } from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import type { WithColumnSpacers } from "../../hooks/use-table-virtualizers"

interface DataTableFooterProps<TData extends RowData> {
  table: DataTableInstance<TData>
  virtualColumns: VirtualItem[]
  withColumnSpacers: WithColumnSpacers
}

/** Whether any leaf column defines a footer (controls whether a `<tfoot>` renders). */
export function hasFooter<TData extends RowData>(
  table: DataTableInstance<TData>
): boolean {
  return table.getAllLeafColumns().some((c) => c.columnDef.footer != null)
}

/**
 * The table `<tfoot>` (aggregation / footer cells). Stickiness is controlled by
 * `enableStickyFooter` (on by default), independent of whether a footer exists.
 */
export function DataTableFooter<TData extends RowData>({
  table,
  virtualColumns,
  withColumnSpacers,
}: DataTableFooterProps<TData>) {
  const { density, enableColumnVirtualization, enableStickyFooter, refs } =
    table.cnTable
  const padding = DENSITY_CELL_PADDING[density]

  return (
    <TableFooter
      ref={refs.tableFooterRef}
      className={cn(enableStickyFooter && "sticky bottom-0 z-20")}
    >
      {table.getFooterGroups().map((footerGroup) => {
        const headers = enableColumnVirtualization
          ? (virtualColumns
              .map((vc) => footerGroup.headers[vc.index])
              .filter(Boolean) as Header<TData, unknown>[])
          : footerGroup.headers
        const cells = headers.map((header) => (
          <TableCell
            key={header.id}
            colSpan={header.colSpan}
            style={{
              ...getWidthStyle(header.column, table),
              ...getColumnPinningStyle(header.column),
            }}
            className={cn(padding, getColumnPinningClass(header.column))}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.footer, header.getContext())}
          </TableCell>
        ))
        return (
          <TableRow key={footerGroup.id} className="hover:bg-transparent">
            {withColumnSpacers(cells, `footer-${footerGroup.id}`)}
          </TableRow>
        )
      })}
    </TableFooter>
  )
}
