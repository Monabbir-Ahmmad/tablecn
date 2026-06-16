"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"

import { SelectionCheckbox } from "../components/body/selection-checkbox"
import type { DataTableLocalization } from "../core/localization"

export const SELECTION_COLUMN_ID = "cn-select"

/**
 * Builds the auto-injected selection column. The header carries the
 * select-all checkbox (with indeterminate state) for multi-select tables; for
 * single-select tables the header is empty. `selectAllMode` selects the current
 * page ("page", default) or every row ("all"); `enableSelectAll: false` hides
 * the header checkbox. Clicks are isolated from row click handlers via
 * `stopPropagation`.
 */
export function createSelectionColumn<TData extends RowData>(
  localization: DataTableLocalization,
  selectAllMode: "page" | "all" = "page",
  enableSelectAll = true
): ColumnDef<TData> {
  return {
    id: SELECTION_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableResizing: false,
    size: 44,
    minSize: 44,
    meta: { disableColumnActions: true, align: "center" },
    header: ({ table }) => {
      // No select-all affordance for single-select tables or when disabled.
      if (!enableSelectAll) return null
      if (table.options.enableMultiRowSelection === false) return null
      const allMode = selectAllMode === "all"
      const allSelected = allMode
        ? table.getIsAllRowsSelected()
        : table.getIsAllPageRowsSelected()
      const someSelected = allMode
        ? table.getIsSomeRowsSelected()
        : table.getIsSomePageRowsSelected()
      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectionCheckbox
            aria-label={localization.selectAll}
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onCheckedChange={(value) =>
              allMode
                ? table.toggleAllRowsSelected(!!value)
                : table.toggleAllPageRowsSelected(!!value)
            }
          />
        </div>
      )
    },
    cell: ({ row }) => (
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectionCheckbox
          aria-label={localization.selectRow}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
  }
}
