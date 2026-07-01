"use client"

import * as React from "react"
import type { ColumnDef, RowData } from "@tanstack/react-table"

import {
  createExpandColumn,
  createRowDragHandleColumn,
  createRowNumberColumn,
} from "../injected-columns/injected-columns"
import { createRowActionsColumn } from "../injected-columns/data-table-row-actions"
import { createSelectionColumn } from "../injected-columns/selection-column"
import type { DataTableIcons } from "../core/icons"
import type { DataTableLocalization } from "../core/localization"
import type { EditDisplayMode, UseDataTableOptions } from "../core/types"

interface UseResolvedColumnsParams<TData extends RowData> {
  columns: ColumnDef<TData, unknown>[]
  enableRowOrdering: boolean
  enableRowSelection: boolean
  selectAllMode: "page" | "all"
  enableSelectAll: boolean
  needsExpandColumn: boolean
  positionExpandColumn: "first" | "last"
  enableRowNumbers: boolean
  rowNumberMode: "static" | "original"
  enableRowPinning: boolean
  renderRowActions: UseDataTableOptions<TData>["renderRowActions"]
  renderRowActionMenuItems: UseDataTableOptions<TData>["renderRowActionMenuItems"]
  positionActionsColumn: "first" | "last"
  enableEditing: boolean
  editDisplayMode: EditDisplayMode
  localization: DataTableLocalization
  icons: DataTableIcons
}

/**
 * Injects the display columns around the user's columns, memoized so TanStack
 * never receives a new `columns` identity per render (a classic infinite-loop /
 * lost-state trap). Leading order: drag handle → selection → expand → row
 * number → user columns. The expand and row-actions columns can move to the
 * trailing/leading edge via `positionExpandColumn` / `positionActionsColumn`.
 */
export function useResolvedColumns<TData extends RowData>({
  columns,
  enableRowOrdering,
  enableRowSelection,
  selectAllMode,
  enableSelectAll,
  needsExpandColumn,
  positionExpandColumn,
  enableRowNumbers,
  rowNumberMode,
  enableRowPinning,
  renderRowActions,
  renderRowActionMenuItems,
  positionActionsColumn,
  enableEditing,
  editDisplayMode,
  localization,
  icons,
}: UseResolvedColumnsParams<TData>): ColumnDef<TData, unknown>[] {
  return React.useMemo(() => {
    const leading = []
    const trailing = []
    if (enableRowOrdering) {
      leading.push(createRowDragHandleColumn<TData>(localization, icons))
    }
    if (enableRowSelection) {
      leading.push(
        createSelectionColumn<TData>(localization, selectAllMode, enableSelectAll)
      )
    }
    if (needsExpandColumn) {
      const expand = createExpandColumn<TData>(localization, icons)
      if (positionExpandColumn === "last") trailing.push(expand)
      else leading.push(expand)
    }
    if (enableRowNumbers) {
      leading.push(
        createRowNumberColumn<TData>(
          localization,
          rowNumberMode,
          enableRowPinning,
          icons
        )
      )
    }
    const showRowActions =
      !!renderRowActions ||
      !!renderRowActionMenuItems ||
      (enableEditing &&
        (editDisplayMode === "row" || editDisplayMode === "modal"))
    if (showRowActions) {
      const actions = createRowActionsColumn<TData>(positionActionsColumn)
      if (positionActionsColumn === "first") leading.unshift(actions)
      else trailing.push(actions)
    }
    return leading.length > 0 || trailing.length > 0
      ? [...leading, ...columns, ...trailing]
      : columns
  }, [
    columns,
    enableRowOrdering,
    enableRowSelection,
    selectAllMode,
    enableSelectAll,
    needsExpandColumn,
    positionExpandColumn,
    enableRowNumbers,
    rowNumberMode,
    enableRowPinning,
    renderRowActions,
    renderRowActionMenuItems,
    positionActionsColumn,
    enableEditing,
    editDisplayMode,
    localization,
    icons,
  ])
}
