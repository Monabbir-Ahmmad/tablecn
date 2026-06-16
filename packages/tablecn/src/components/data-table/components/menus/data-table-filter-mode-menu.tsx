"use client"

import type { Column, RowData } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { modeOptionsForVariant, type FilterMode } from "../../fns/filter-fns"
import { getEffectiveMode } from "../../helpers/effective-filter-mode"
import type { DataTableInstance } from "../../core/types"

/**
 * The `Filter` adornment that opens a mode menu (contains/equals/…; numeric and
 * date variants get their own sets). Swapping the mode changes the column's
 * `filterFn` and resets the stale value. Hidden when the variant has a single
 * fixed mode or modes are disabled.
 */
export function DataTableFilterModeMenu<TData extends RowData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>
  table: DataTableInstance<TData>
}) {
  const {
    localization,
    icons,
    setColumnFilterMode,
    enableColumnFilterModes,
    renderColumnFilterModeMenuItems,
  } = table.cnTable
  const variant = column.columnDef.meta?.variant ?? "text"
  const perColumn = column.columnDef.meta?.enableColumnFilterModes
  const enabled = perColumn ?? enableColumnFilterModes
  // Restrict (and order) to the column's allowed subset when provided.
  const allowed = column.columnDef.meta?.columnFilterModeOptions
  const variantModes = modeOptionsForVariant(variant)
  const modes = allowed
    ? allowed.filter((mode) => variantModes.includes(mode))
    : variantModes

  if (!enabled || modes.length === 0) return null

  const current = getEffectiveMode(column, table)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={localization.changeFilterMode}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 aria-expanded:text-foreground"
              )}
            >
              <icons.filter className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{localization.filterMode}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>{localization.filterMode}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderColumnFilterModeMenuItems ? (
          renderColumnFilterModeMenuItems({
            column: column as Column<TData, unknown>,
            modes,
            currentMode: current,
            onSelect: (mode) => setColumnFilterMode(column.id, mode),
            table,
          })
        ) : (
          <DropdownMenuRadioGroup
            value={current}
            onValueChange={(value) =>
              setColumnFilterMode(column.id, value as FilterMode)
            }
          >
            {modes.map((mode) => (
              <DropdownMenuRadioItem key={mode} value={mode}>
                {localization.filterModes[mode] ?? mode}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
