import {
  EXPAND_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
} from "../display-columns/display-columns"
import { ROW_ACTIONS_COLUMN_ID } from "../display-columns/data-table-row-actions"
import { SELECTION_COLUMN_ID } from "../display-columns/selection-column"
import type { Density } from "./types"

export const DENSITY_ORDER: Density[] = ["comfortable", "compact", "spacious"]

/** Vertical padding utility per density level, applied to header + body cells. */
export const DENSITY_CELL_PADDING: Record<Density, string> = {
  compact: "py-1",
  comfortable: "py-2.5",
  spacious: "py-4",
}

/** Horizontal alignment → text-align utility, applied to body cells. */
export const ALIGN_CELL = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

/** Injected columns that should never be draggable in the header. */
export const DISPLAY_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
])

// All injected (non-user) columns, used to find the first real data column so
// tree (sub-row) rows can be indented by depth there.
export const NON_DATA_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
  ROW_ACTIONS_COLUMN_ID,
])
