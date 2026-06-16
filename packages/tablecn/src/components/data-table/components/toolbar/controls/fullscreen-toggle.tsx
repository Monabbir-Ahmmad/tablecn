"use client"

import type { RowData } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

import type { DataTableInstance } from "../../../core/types"

/** Full-screen toggle (state-driven; the surface fixes itself to the viewport). */
export function DataTableFullscreenToggle<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const { localization, icons, isFullscreen, setIsFullscreen } = table.cnTable
  const label = isFullscreen
    ? localization.exitFullscreen
    : localization.enterFullscreen
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={isFullscreen}
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="size-8"
        >
          {isFullscreen ? <icons.fullscreenExit /> : <icons.fullscreenEnter />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
