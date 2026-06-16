"use client"

import * as React from "react"
import type { Row, RowData } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import type { DataTableInstance } from "../core/types"

export interface VirtualRowItem<TData extends RowData> {
  row: Row<TData>
  detail: boolean
}

/** Wraps a window of cells with left/right spacers when virtualizing columns. */
export type WithColumnSpacers = (
  cells: React.ReactNode[],
  keyPrefix: string
) => React.ReactNode

/**
 * Row + column virtualization for {@link DataTable}. Builds the flattened
 * virtualization list (center rows + their expanded detail panels), wires both
 * `@tanstack/react-virtual` instances, exposes them via the optional instance
 * refs, and returns the helpers the header/body/footer need to render only the
 * visible window with left/right column spacers.
 */
export function useTableVirtualizers<TData extends RowData>(
  table: DataTableInstance<TData>,
  gridRef: React.RefObject<HTMLDivElement | null>
) {
  const {
    enableRowVirtualization,
    enableColumnVirtualization,
    renderDetailPanel,
    estimateRowHeight,
    virtualOverscan,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
  } = table.cnTable

  // Flatten center rows (+ expanded detail panels) into a virtualization list.
  const virtualItems: VirtualRowItem<TData>[] = []
  if (enableRowVirtualization) {
    for (const row of table.getCenterRows()) {
      virtualItems.push({ row, detail: false })
      if (renderDetailPanel && row.getIsExpanded() && !row.getIsGrouped()) {
        virtualItems.push({ row, detail: true })
      }
    }
  }

  // User-supplied passthrough options, resolved from their value-or-function form.
  const rowVOptions =
    typeof rowVirtualizerOptions === "function"
      ? rowVirtualizerOptions({ table })
      : rowVirtualizerOptions
  const columnVOptions =
    typeof columnVirtualizerOptions === "function"
      ? columnVirtualizerOptions({ table })
      : columnVirtualizerOptions

  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: virtualOverscan,
    measureElement:
      typeof window !== "undefined"
        ? (el) => el?.getBoundingClientRect().height ?? 0
        : undefined,
    ...rowVOptions,
  })

  // Horizontal virtualizer for wide tables. When off, count is 0 and the
  // helpers below fall through to rendering all columns.
  const leafColumns = table.getVisibleLeafColumns()
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: enableColumnVirtualization ? leafColumns.length : 0,
    getScrollElement: () => gridRef.current,
    estimateSize: (index) => leafColumns[index]?.getSize() ?? 150,
    overscan: virtualOverscan,
    ...columnVOptions,
  })

  // Expose the virtualizer instances for imperative control (e.g. scrollToIndex).
  React.useEffect(() => {
    if (rowVirtualizerInstanceRef)
      rowVirtualizerInstanceRef.current = rowVirtualizer
  })
  React.useEffect(() => {
    if (columnVirtualizerInstanceRef)
      columnVirtualizerInstanceRef.current = columnVirtualizer
  })

  const virtualColumns = enableColumnVirtualization
    ? columnVirtualizer.getVirtualItems()
    : []
  const colSpacerLeft = virtualColumns.length
    ? (virtualColumns[0]?.start ?? 0)
    : 0
  const colSpacerRight = virtualColumns.length
    ? columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
    : 0

  /** Wraps a row of cells with left/right spacers when virtualizing columns. */
  const withColumnSpacers = (
    cells: React.ReactNode[],
    keyPrefix: string
  ): React.ReactNode => {
    if (!enableColumnVirtualization) return cells
    return (
      <>
        {colSpacerLeft > 0 && (
          <td
            key={`${keyPrefix}-spacer-l`}
            aria-hidden
            style={{ width: colSpacerLeft }}
          />
        )}
        {cells}
        {colSpacerRight > 0 && (
          <td
            key={`${keyPrefix}-spacer-r`}
            aria-hidden
            style={{ width: colSpacerRight }}
          />
        )}
      </>
    )
  }

  return {
    rowVirtualizer,
    columnVirtualizer,
    virtualItems,
    virtualColumns,
    withColumnSpacers,
  }
}
