"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import { DENSITY_ORDER } from "../../../core/constants"
import type { DataTableInstance } from "../../../core/types"

const DENSITY_LABEL_KEYS = {
  comfortable: "densityComfortable",
  compact: "densityCompact",
  spacious: "densitySpacious",
} as const

/** Single button that cycles comfortable → compact → spacious. */
export function DataTableDensityToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, density, setDensity } = table.cnTable
  const currentLabel = localization[DENSITY_LABEL_KEYS[density]]
  const label = `${localization.toggleDensity} (${currentLabel})`
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          className="size-8"
          onClick={() =>
            setDensity((prev) => {
              const next =
                DENSITY_ORDER[
                  (DENSITY_ORDER.indexOf(prev) + 1) % DENSITY_ORDER.length
                ]
              return next ?? "comfortable"
            })
          }
        >
          <icons.density />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
