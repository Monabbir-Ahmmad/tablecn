import type * as React from "react"
import type {
  Cell,
  Column,
  Row,
  RowData,
  Table,
  TableOptions,
} from "@tanstack/react-table"

import type { Virtualizer, VirtualizerOptions } from "@tanstack/react-virtual"

import type { DataTableLocalization } from "./localization"
import type { FilterMode, GlobalFilterMode } from "./filter-fns"
import type { DataTableIcons } from "./icons"

export type Density = "compact" | "comfortable" | "spacious"

/** The `@tanstack/react-virtual` instance powering body-row virtualization. */
export type DataTableRowVirtualizer = Virtualizer<
  HTMLDivElement,
  HTMLTableRowElement
>
/** The `@tanstack/react-virtual` instance powering column virtualization. */
export type DataTableColumnVirtualizer = Virtualizer<
  HTMLDivElement,
  HTMLTableCellElement
>

/** A value, or a function of the table instance returning that value. */
type ValueOrFunc<TData extends RowData, TValue> =
  | TValue
  | ((props: { table: DataTableInstance<TData> }) => TValue)

/** Partial passthrough merged into the row `useVirtualizer` call. */
export type RowVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableRowElement>>
>
/** Partial passthrough merged into the column `useVirtualizer` call. */
export type ColumnVirtualizerOptions<TData extends RowData> = ValueOrFunc<
  TData,
  Partial<VirtualizerOptions<HTMLDivElement, HTMLTableCellElement>>
>

/** Filter UI variants (full set wired in Phase 2; Phase 1 ships "text"). */
export type FilterVariant =
  | "text"
  | "select"
  | "multi-select"
  | "checkbox"
  | "range"
  | "range-slider"
  | "date"
  | "date-range"

export interface DataTableFilterOption {
  label: string
  value: string
}

export type EditDisplayMode = "cell" | "row" | "table" | "modal" | "custom"

/** Which cell is being edited (cell mode). */
export interface EditingCell {
  rowId: string
  columnId: string
}

/** Edit-field variants for the inline editors. */
export type EditVariant = "text" | "number" | "select"

// Per-column configuration carried on `columnDef.meta`. Augments the TanStack
// `ColumnMeta` interface so it is strongly typed everywhere `meta` is read.
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Filter UI variant rendered in the filter row. Defaults to "text". */
    variant?: FilterVariant
    /** Options for `select` / `multi-select` filter variants. If omitted for a
     *  select-style variant, options are derived from faceted unique values. */
    options?: DataTableFilterOption[]
    /** Default filter mode for this column (overrides the per-variant default). */
    filterMode?: FilterMode
    /** Per-column override for the filter-mode menu (defaults to the table). */
    enableColumnFilterModes?: boolean
    /** Custom filter UI for this column (escape hatch). Replaces the variant. */
    renderColumnFilter?: (props: {
      column: Column<TData, TValue>
      table: DataTableInstance<TData>
    }) => React.ReactNode
    /** Restrict (and order) the filter-mode menu for this column to this subset
     *  of modes. Include the column's default mode. */
    columnFilterModeOptions?: FilterMode[]
    /** Allow editing this column (defaults to true when table editing is on). */
    enableEditing?: boolean
    /** Inline editor variant. Defaults to "text". */
    editVariant?: EditVariant
    /** Options for the "select" edit variant. */
    editSelectOptions?: DataTableFilterOption[]
    /** Custom inline editor for this column (escape hatch). Replaces the built-in
     *  editor while the cell/row is editing; drive the value via `table.cnTable`
     *  (`rowDraft`/`setRowDraftValue` or `onEditCellSave`). */
    renderEditCell?: (props: CellRenderProps<TData, TValue>) => React.ReactNode
    /** Custom render for this column's group header cell (when grouped). */
    renderGroupedCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Custom render for this column's aggregated cell (when grouped). Overrides
     *  the TanStack `columnDef.aggregatedCell`. */
    renderAggregatedCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Custom render for this column's placeholder cells in grouped rows (cells
     *  with no value because another column owns the group). Default: empty. */
    renderPlaceholderCell?: (
      props: CellRenderProps<TData, TValue>
    ) => React.ReactNode
    /** Validate an edited value; return an error message or undefined if valid. */
    validate?: (value: unknown) => string | undefined
    /** Show a click-to-copy affordance on this column's cells. */
    enableClickToCopy?: boolean
    /** Horizontal alignment applied to the header label and body cells. */
    align?: "left" | "center" | "right"
    /** Opt this column out of match highlighting. */
    disableHighlight?: boolean
    /** Hide the column-actions menu for this column. */
    disableColumnActions?: boolean
    /** Human-readable label for menus when the header is not a plain string. */
    label?: string
  }
}

export interface DataTableSlotProps<TData extends RowData> {
  table: DataTableInstance<TData>
}

export interface RowEvent<TData extends RowData> {
  row: Row<TData>
  table: DataTableInstance<TData>
  event: React.MouseEvent<HTMLTableRowElement>
}

export interface CellEvent<TData extends RowData> {
  cell: Cell<TData, unknown>
  row: Row<TData>
  table: DataTableInstance<TData>
  event: React.MouseEvent<HTMLTableCellElement>
}

/** Props passed to per-column cell render hooks on `columnDef.meta`. */
export interface CellRenderProps<TData extends RowData, TValue = unknown> {
  cell: Cell<TData, TValue>
  row: Row<TData>
  column: Column<TData, TValue>
  table: DataTableInstance<TData>
}

/**
 * Our configuration + UI state, attached to the TanStack table instance under
 * `table.cnTable`. Sub-components read it from the instance rather than via
 * prop drilling (mirrors Material React Table's `table.options` pattern).
 */
export interface DataTableConfig<TData extends RowData> {
  localization: DataTableLocalization
  icons: DataTableIcons
  density: Density
  setDensity: React.Dispatch<React.SetStateAction<Density>>
  isFullscreen: boolean
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  showColumnFilters: boolean
  setShowColumnFilters: React.Dispatch<React.SetStateAction<boolean>>
  /** Active filter mode per column id. */
  columnFilterModes: Record<string, FilterMode>
  /** Switch a column's filter mode (resets the value when it becomes invalid). */
  setColumnFilterMode: (columnId: string, mode: FilterMode) => void
  globalFilterMode: GlobalFilterMode
  setGlobalFilterMode: (mode: GlobalFilterMode) => void
  enableGlobalFilter: boolean
  enableGlobalFilterModes: boolean
  isLoading: boolean
  isSaving: boolean
  showProgressBars: boolean
  showSkeletons: boolean
  showLoadingOverlay: boolean
  enableFacetedValues: boolean
  enableColumnActions: boolean
  enableColumnFilters: boolean
  enableColumnFilterModes: boolean
  enableFilterMatchHighlighting: boolean
  /** Column ids that supply a custom cell renderer (skipped by auto-highlight). */
  columnsWithCustomCell: ReadonlySet<string>
  enableColumnOrdering: boolean
  enableColumnPinning: boolean
  enableColumnResizing: boolean
  enableRowOrdering: boolean
  enableRowPinning: boolean
  enableRowNumbers: boolean
  rowNumberMode: "static" | "original"
  /** Called on a row drag-and-drop reorder; the consumer reorders its data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void
  enableGrouping: boolean
  enableExpanding: boolean
  enableStickyFooter: boolean
  renderDetailPanel?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Editing / actions
  enableEditing: boolean
  editDisplayMode: EditDisplayMode
  editingCell: EditingCell | null
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>
  editingRowId: string | null
  isCreating: boolean
  /** Draft values for the row/modal editor + create form, keyed by column id. */
  rowDraft: Record<string, unknown>
  setRowDraftValue: (columnId: string, value: unknown) => void
  /** Enter row/modal editing for a row, seeding the draft from its values. */
  beginRowEdit: (row: Row<TData>) => void
  /** Open the create form, seeding the draft from `createRowDefaults`. */
  beginCreate: () => void
  /** Exit any editing/creating state, discarding the draft. */
  cancelEdit: () => void
  enableClickToCopy: boolean
  onEditCellSave?: (props: {
    row: Row<TData>
    column: Column<TData, unknown>
    value: unknown
    table: DataTableInstance<TData>
  }) => void
  onSaveRow?: (props: {
    row: Row<TData>
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  onCreateRow?: (props: {
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  renderRowActions?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderCellActionMenuItems?: (props: {
    cell: Cell<TData, unknown>
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderRowActionMenuItems?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderColumnActionsMenuItems?: (props: {
    column: Column<TData, unknown>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderColumnFilterModeMenuItems?: (props: {
    column: Column<TData, unknown>
    modes: FilterMode[]
    currentMode: FilterMode
    onSelect: (mode: FilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[]
    currentMode: GlobalFilterMode
    onSelect: (mode: GlobalFilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Event listeners
  onRowClick?: (props: RowEvent<TData>) => void
  onRowDoubleClick?: (props: RowEvent<TData>) => void
  onCellClick?: (props: CellEvent<TData>) => void
  onCellDoubleClick?: (props: CellEvent<TData>) => void

  enableRowVirtualization: boolean
  enableColumnVirtualization: boolean
  estimateRowHeight: number
  virtualOverscan: number
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>
  enableExport: boolean
  exportFileName?: string
  enableStickyHeader: boolean
  enablePagination: boolean
  positionPagination: "top" | "bottom" | "both" | "none"
  positionGlobalFilter: "left" | "right" | "none"
  positionToolbarAlertBanner: "top" | "bottom" | "none"
  positionToolbarDropZone: "top" | "bottom" | "both" | "none"
  enableRowSelection: boolean
  enableTopToolbar: boolean
  enableBottomToolbar: boolean
  enableDensityToggle: boolean
  enableFullscreenToggle: boolean
  enableToolbarInternalActions: boolean
  enableKeyboardNavigation: boolean
  title?: React.ReactNode
  renderToolbarActions?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderToolbarInternalActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  renderBottomToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode
}

/** A TanStack table instance enriched with our `cnTable` config. */
export type DataTableInstance<TData extends RowData = unknown> =
  Table<TData> & {
    cnTable: DataTableConfig<TData>
  }

/**
 * Options for {@link useDataTable}. Extends the full TanStack `TableOptions`
 * (so controlled state, `manual*` flags, `getRowId`, etc. all pass through)
 * and adds our presentation/feature options. `getCoreRowModel` and the other
 * row models are supplied with sensible defaults but can be overridden.
 */
export interface UseDataTableOptions<TData extends RowData> extends Omit<
  TableOptions<TData>,
  "getCoreRowModel"
> {
  getCoreRowModel?: TableOptions<TData>["getCoreRowModel"]
  localization?: Partial<DataTableLocalization>
  /** Override any subset of the table's icons. */
  icons?: Partial<DataTableIcons>
  /** Initial density. Uncontrolled. */
  defaultDensity?: Density
  /** Initially show the filter row. Uncontrolled. */
  defaultShowColumnFilters?: boolean
  /** Show the loading affordances (progress bar; skeletons when empty; a dimming
   *  overlay over existing rows). Toggle each independently below. */
  isLoading?: boolean
  /** Show the progress bar for an in-flight save/mutation. Defaults the progress
   *  bar on without replacing rows with skeletons. */
  isSaving?: boolean
  /** Show the top progress bar. Default: `isLoading || isSaving`. */
  showProgressBars?: boolean
  /** Replace the body with skeleton rows while empty. Default: `isLoading`. */
  showSkeletons?: boolean
  /** Dim existing rows with an overlay while loading. Default: `isLoading`. */
  showLoadingOverlay?: boolean
  /** Compute faceted unique values / min-max (auto select options + range
   *  bounds). Default true; disable to skip the faceted row models. */
  enableFacetedValues?: boolean
  enableColumnActions?: boolean
  /** Show the filter-mode menu adornment on filter fields. Default true. */
  enableColumnFilterModes?: boolean
  /** Highlight matched substrings in cells. Default true. */
  enableFilterMatchHighlighting?: boolean
  /** Show the expandable global search in the toolbar. Default true. */
  enableGlobalFilter?: boolean
  /** Show the global search mode menu (fuzzy/contains/…). Default true. */
  enableGlobalFilterModes?: boolean
  /** Initial global search mode. Default "fuzzy". */
  defaultGlobalFilterMode?: GlobalFilterMode
  /** Controlled density. Pair with `onDensityChange`; omit for uncontrolled
   *  (seed the initial value with `defaultDensity`). */
  density?: Density
  /** Called whenever the density changes (toolbar toggle or programmatic). */
  onDensityChange?: (density: Density) => void
  /** Controlled full-screen state. Pair with `onIsFullscreenChange`. */
  isFullscreen?: boolean
  /** Called whenever the full-screen state is toggled. */
  onIsFullscreenChange?: (isFullscreen: boolean) => void
  /** Controlled filter-row visibility. Pair with `onShowColumnFiltersChange`;
   *  omit for uncontrolled (seed with `defaultShowColumnFilters`). */
  showColumnFilters?: boolean
  /** Called whenever the filter row is shown or hidden. */
  onShowColumnFiltersChange?: (showColumnFilters: boolean) => void
  /** Controlled global search mode. Pair with `onGlobalFilterModeChange`;
   *  omit for uncontrolled (seed with `defaultGlobalFilterMode`). */
  globalFilterMode?: GlobalFilterMode
  /** Called whenever the global search mode changes. */
  onGlobalFilterModeChange?: (mode: GlobalFilterMode) => void
  /** Drag-and-drop column reordering (adds a grip to each header). */
  enableColumnOrdering?: boolean
  /** Column pinning (left/right) via the column-actions menu + sticky columns. */
  enableColumnPinning?: boolean
  /** Column resizing via an edge drag handle. */
  enableColumnResizing?: boolean
  /** Drag-and-drop row reordering (adds a drag-handle column). */
  enableRowOrdering?: boolean
  /** Row pinning (top) via a pin toggle in the row-number column. */
  enableRowPinning?: boolean
  /** Adds a leading row-number column. */
  enableRowNumbers?: boolean
  /** "static" tracks the current view (page-aware); "original" uses source index. */
  rowNumberMode?: "static" | "original"
  /** Called on a row drag-and-drop reorder; the consumer reorders its data. */
  onRowOrderChange?: (activeRowId: string, overRowId: string) => void
  /** Row grouping (group-by menu + drop-to-group zone + aggregated group rows). */
  enableGrouping?: boolean
  /** Row expansion (tree sub-rows and/or detail panels). Auto-on with grouping
   *  or when `renderDetailPanel`/`getSubRows` is provided. */
  enableExpanding?: boolean
  /** Pin the footer (aggregation/footer cells) to the bottom of the surface.
   *  Default true (matches the sticky header). */
  enableStickyFooter?: boolean
  /** Render an expanding detail panel for each row. */
  renderDetailPanel?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode

  // Editing / actions
  /** Enable inline editing. */
  enableEditing?: boolean
  /** How edits are surfaced. Default "cell". */
  editDisplayMode?: EditDisplayMode
  /** Default values for the create form, keyed by column id. */
  createRowDefaults?: Record<string, unknown>
  /** Show a click-to-copy affordance on all cells (per-column override via meta). */
  enableClickToCopy?: boolean
  onEditCellSave?: (props: {
    row: Row<TData>
    column: Column<TData, unknown>
    value: unknown
    table: DataTableInstance<TData>
  }) => void
  onSaveRow?: (props: {
    row: Row<TData>
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  onCreateRow?: (props: {
    values: Record<string, unknown>
    table: DataTableInstance<TData>
    exit: () => void
  }) => void
  renderRowActions?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  renderCellActionMenuItems?: (props: {
    cell: Cell<TData, unknown>
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Render a kebab menu in the row-actions column. Returns the menu items
   *  (e.g. `<DropdownMenuItem>`); injects the actions column automatically. */
  renderRowActionMenuItems?: (props: {
    row: Row<TData>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Append custom items to the bottom of every column-actions menu. Returns the
   *  items (e.g. `<DropdownMenuItem>`); a separator is added before them. */
  renderColumnActionsMenuItems?: (props: {
    column: Column<TData, unknown>
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Replace the radio items in a column's filter-mode menu. Render your own
   *  items and call `onSelect(mode)` to switch; `modes` is the allowed set. */
  renderColumnFilterModeMenuItems?: (props: {
    column: Column<TData, unknown>
    modes: FilterMode[]
    currentMode: FilterMode
    onSelect: (mode: FilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode
  /** Replace the radio items in the global-search mode menu. Render your own
   *  items and call `onSelect(mode)` to switch; `modes` is the allowed set. */
  renderGlobalFilterModeMenuItems?: (props: {
    modes: GlobalFilterMode[]
    currentMode: GlobalFilterMode
    onSelect: (mode: GlobalFilterMode) => void
    table: DataTableInstance<TData>
  }) => React.ReactNode

  /** Fired when a body row is clicked / double-clicked. */
  onRowClick?: (props: RowEvent<TData>) => void
  onRowDoubleClick?: (props: RowEvent<TData>) => void
  /** Fired when a body cell is clicked / double-clicked. */
  onCellClick?: (props: CellEvent<TData>) => void
  onCellDoubleClick?: (props: CellEvent<TData>) => void

  /** Virtualize body rows for large datasets (recommended past ~100 rows).
   *  The table surface becomes the scroll container — give it a bounded height
   *  via `className`/`style` (defaults to `max-h-[600px]`). Disables row DnD. */
  enableRowVirtualization?: boolean
  /** Virtualize columns for very wide tables. Applies fixed column widths and
   *  is not combined with column pinning/ordering. */
  enableColumnVirtualization?: boolean
  /** Estimated row height (px) for the virtualizer. Default 52. */
  estimateRowHeight?: number
  /** Extra rows rendered above/below the viewport. Default 8. */
  virtualOverscan?: number
  /** Partial `@tanstack/react-virtual` options merged into the row virtualizer
   *  (overrides the built-in `count`/`estimateSize`/`overscan`/`measureElement`).
   *  Accepts an object or a `({ table }) => options` function. */
  rowVirtualizerOptions?: RowVirtualizerOptions<TData>
  /** Partial `@tanstack/react-virtual` options merged into the column
   *  virtualizer. Accepts an object or a `({ table }) => options` function. */
  columnVirtualizerOptions?: ColumnVirtualizerOptions<TData>
  /** Ref populated with the row `Virtualizer` instance for imperative control
   *  (e.g. `scrollToIndex`). Only set when `enableRowVirtualization`. */
  rowVirtualizerInstanceRef?: React.RefObject<DataTableRowVirtualizer | null>
  /** Ref populated with the column `Virtualizer` instance. Only set when
   *  `enableColumnVirtualization`. */
  columnVirtualizerInstanceRef?: React.RefObject<DataTableColumnVirtualizer | null>
  /** Show a CSV/Excel export menu in the toolbar. */
  enableExport?: boolean
  /** Base file name for exports (no extension). Default "export". */
  exportFileName?: string
  enableStickyHeader?: boolean
  enablePagination?: boolean
  /** Where the pagination controls render. Default "bottom". "none" keeps
   *  pagination active but hides the controls. */
  positionPagination?: "top" | "bottom" | "both" | "none"
  /** Which toolbar region the global search renders in. Default "right" (the
   *  internal-actions cluster). "left" places it next to the title/actions;
   *  "none" hides it (same as `enableGlobalFilter: false`). */
  positionGlobalFilter?: "left" | "right" | "none"
  /** Where the row-selection alert banner renders. Default "top". */
  positionToolbarAlertBanner?: "top" | "bottom" | "none"
  /** Where the group-by drop zone renders (grouping only). Default "top". */
  positionToolbarDropZone?: "top" | "bottom" | "both" | "none"
  /** Position of the auto-injected row-actions column. Default "last". */
  positionActionsColumn?: "first" | "last"
  /** Position of the auto-injected expand column (tree / detail panel).
   *  Default "first". */
  positionExpandColumn?: "first" | "last"
  /** Select-all scope for the header checkbox: the current page ("page",
   *  default) or every row ("all"). */
  selectAllMode?: "page" | "all"
  /** Show the select-all checkbox in the selection column header. Default true. */
  enableSelectAll?: boolean
  enableTopToolbar?: boolean
  enableBottomToolbar?: boolean
  /** Show the density toggle in the toolbar. Default true. */
  enableDensityToggle?: boolean
  /** Show the full-screen toggle in the toolbar. Default true. */
  enableFullscreenToggle?: boolean
  /** Show the toolbar's internal icon-action cluster (search, filters, column
   *  visibility, export, density, full screen). Default true. Hides the whole
   *  cluster at once; use the per-item flags for finer control. */
  enableToolbarInternalActions?: boolean
  enableKeyboardNavigation?: boolean
  title?: React.ReactNode
  /** Custom content rendered in the top toolbar's left region (next to the
   *  title), e.g. bulk-action buttons. */
  renderToolbarActions?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Replace the entire top toolbar with custom content. */
  renderTopToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Replace the entire bottom toolbar (pagination region) with custom content. */
  renderBottomToolbar?: (props: DataTableSlotProps<TData>) => React.ReactNode
  /** Replace the top toolbar's internal icon-action cluster with custom content. */
  renderToolbarInternalActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  /** Custom content rendered in the bottom toolbar's left region (next to
   *  pagination), e.g. summary text or actions. */
  renderBottomToolbarCustomActions?: (
    props: DataTableSlotProps<TData>
  ) => React.ReactNode
  /** Render a `<caption>` for the table (e.g. an accessible summary). */
  renderCaption?: (props: DataTableSlotProps<TData>) => React.ReactNode
  renderEmpty?: (props: DataTableSlotProps<TData>) => React.ReactNode
}

export const DENSITY_ORDER: Density[] = ["comfortable", "compact", "spacious"]

/** Vertical padding utility per density level, applied to header + body cells. */
export const DENSITY_CELL_PADDING: Record<Density, string> = {
  compact: "py-1",
  comfortable: "py-2.5",
  spacious: "py-4",
}
