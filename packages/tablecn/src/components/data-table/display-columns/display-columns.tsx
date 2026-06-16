"use client"

// Barrel for the injected leading/trailing display-column factories. Each lives
// in its own file; selection and row-actions columns are siblings in this
// folder. Many modules import the column-id constants from here.

export { EXPAND_COLUMN_ID, createExpandColumn } from "./expand-column"
export {
  ROW_DRAG_COLUMN_ID,
  RowDragContext,
  createRowDragHandleColumn,
  type RowDragHandleProps,
} from "./row-drag-column"
export { ROW_NUMBER_COLUMN_ID, createRowNumberColumn } from "./row-number-column"
