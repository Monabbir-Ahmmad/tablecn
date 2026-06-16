import type { CSSProperties } from "react"
import type { Column, RowData, Table } from "@tanstack/react-table"

import type { DataTableInstance } from "../core/types"

/**
 * Sticky positioning for a pinned column. Offsets come from TanStack
 * (`getStart`/`getAfter`) so multiple pinned columns stack correctly.
 */
export function getColumnPinningStyle<TData extends RowData, TValue>(
  column: Column<TData, TValue>
): CSSProperties {
  const pinned = column.getIsPinned()
  if (!pinned) return {}
  return {
    position: "sticky",
    zIndex: 2,
    ...(pinned === "left"
      ? { left: column.getStart("left") }
      : { right: column.getAfter("right") }),
  }
}

/**
 * Edge-shadow class for the boundary pinned columns (last left / first right),
 * built from `--border` (via a utility) so it reads in light and dark.
 */
export function getColumnPinningClass<TData extends RowData, TValue>(
  column: Column<TData, TValue>
): string {
  const pinned = column.getIsPinned()
  if (!pinned) return ""
  const isLastLeft =
    pinned === "left" && column.getIsLastColumn("left")
  const isFirstRight =
    pinned === "right" && column.getIsFirstColumn("right")
  if (isLastLeft) {
    return "after:pointer-events-none after:absolute after:inset-y-0 after:-right-px after:w-2 after:translate-x-full after:bg-gradient-to-r after:from-border/60 after:to-transparent"
  }
  if (isFirstRight) {
    return "before:pointer-events-none before:absolute before:inset-y-0 before:-left-px before:w-2 before:-translate-x-full before:bg-gradient-to-l before:from-border/60 before:to-transparent"
  }
  return ""
}

/**
 * CSS custom properties holding each column's size, set once on the table
 * element. Cells read them via `width: calc(var(--col-…-size) * 1px)` so a
 * resize drag updates a variable instead of re-rendering every cell.
 */
export function getColumnSizeVars<TData extends RowData>(
  table: Table<TData>
): Record<string, string> {
  const headers = table.getFlatHeaders()
  const vars: Record<string, string> = {}
  for (const header of headers) {
    vars[`--header-${header.id}-size`] = `${header.getSize()}`
    vars[`--col-${header.column.id}-size`] = `${header.column.getSize()}`
  }
  return vars
}

export function getColumnWidthStyle(columnId: string): CSSProperties {
  return { width: `calc(var(--col-${columnId}-size) * 1px)` }
}

/**
 * Resolves a column's width style. While resizing, widths come from CSS vars.
 * Otherwise honor an explicitly defined `columnDef.size` (MRT behaviour) but
 * leave unsized columns to the browser's auto layout so the table still fills
 * its container. Column virtualization needs every column to have a concrete
 * width.
 */
export function getWidthStyle<TData extends RowData>(
  column: Column<TData, unknown>,
  table: DataTableInstance<TData>
): CSSProperties {
  const { enableColumnResizing, enableColumnVirtualization } = table.cnTable
  if (enableColumnResizing) return getColumnWidthStyle(column.id)
  if (enableColumnVirtualization || column.columnDef.size != null) {
    const size = column.getSize()
    return { width: size, minWidth: size }
  }
  return {}
}
