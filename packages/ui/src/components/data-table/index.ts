"use client"

// Core public API
export { DataTable } from "./data-table"
export { useDataTable } from "./use-data-table"

// Building blocks (for custom layouts / advanced composition)
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableColumnActions, getColumnLabel } from "./data-table-column-actions"
export { DataTableColumnFilter } from "./data-table-column-filter"
export {
  DataTableFilterModeMenu,
  getEffectiveMode,
} from "./data-table-filter-mode-menu"
export {
  TextFilterField,
  NumberFilterField,
  RangeSliderFilterField,
  SelectFilterField,
  MultiSelectFilterField,
  CheckboxFilterField,
  DateFilterField,
  DateRangeFilterField,
} from "./data-table-filter-variants"
export type { FilterFieldProps } from "./data-table-filter-variants"
export { Highlight } from "./highlight"
export { DataTableGlobalFilter } from "./data-table-global-filter"
export {
  createDynamicFilterFn,
  createGlobalFilterFn,
  defaultModeForVariant,
  modeOptionsForVariant,
  VALUELESS_MODES,
  SUBSTRING_MODES,
} from "./filter-fns"
export type { FilterMode, GlobalFilterMode } from "./filter-fns"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableViewOptions } from "./data-table-view-options"
export {
  DataTableToolbar,
  DataTableAlertBanner,
} from "./data-table-toolbar"
export {
  DataTableDensityToggle,
  DataTableFilterToggle,
  DataTableFullscreenToggle,
} from "./data-table-toolbar-controls"
export { SelectionCheckbox } from "./selection-checkbox"
export {
  createSelectionColumn,
  SELECTION_COLUMN_ID,
} from "./selection-column"
export {
  createRowNumberColumn,
  createRowDragHandleColumn,
  createExpandColumn,
  RowDragContext,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
} from "./display-columns"
export {
  DataTableDropToGroupZone,
  GROUP_DROPZONE_ID,
} from "./data-table-grouping"
export {
  createRowActionsColumn,
  ROW_ACTIONS_COLUMN_ID,
} from "./data-table-row-actions"
export { DataTableEditField } from "./data-table-edit-field"
export {
  DataTableBodyCellContent,
  isColumnEditable,
} from "./data-table-edit-cell"
export { DataTableEditModal } from "./data-table-edit-modal"
export { ClickToCopy } from "./click-to-copy"
export { DataTableExportMenu } from "./data-table-export-menu"
export {
  exportToCsv,
  exportToExcel,
  toAOA,
  getExportableColumns,
} from "./export-utils"
export type { ExportScope, ExportOptions } from "./export-utils"
export {
  DataTableHeadCell,
  DataTableBodyRow,
  ColumnResizeHandle,
} from "./data-table-dnd"
export {
  getColumnPinningStyle,
  getColumnPinningClass,
  getColumnSizeVars,
  getColumnWidthStyle,
} from "./column-styles"

// Localization & icons
export { defaultLocalization } from "./localization"
export type { DataTableLocalization } from "./localization"
export { defaultIcons } from "./icons"
export type { DataTableIcons, IconComponent } from "./icons"
export {
  DataTableConfigProvider,
  useDataTableConfigContext,
} from "./config-context"
export type { DataTableConfigContextValue } from "./config-context"

// Types
export {
  DENSITY_ORDER,
  DENSITY_CELL_PADDING,
} from "./types"
export type {
  Density,
  FilterVariant,
  DataTableFilterOption,
  DataTableConfig,
  DataTableInstance,
  DataTableSlotProps,
  UseDataTableOptions,
  EditDisplayMode,
  EditVariant,
  EditingCell,
  RowEvent,
  CellEvent,
  DataTableRowVirtualizer,
  DataTableColumnVirtualizer,
  RowVirtualizerOptions,
  ColumnVirtualizerOptions,
} from "./types"
