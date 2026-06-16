"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  useReactTable,
  type RowData,
} from "@tanstack/react-table"

import { VALUELESS_MODES, type FilterMode } from "../fns/filter-fns"
import { columnKey } from "../helpers/column-key"
import { useControllableState } from "../hooks/use-controllable-state"
import { useEditingState } from "../hooks/use-editing-state"
import { useColumnFilterModes } from "../hooks/use-column-filter-modes"
import { useGlobalFilterMode } from "../hooks/use-global-filter-mode"
import { useResolvedColumns } from "../hooks/use-resolved-columns"
import { usePageResetOnFilterChange } from "../hooks/use-page-reset-on-filter-change"
import { useDataTableConfigContext } from "./config-context"
import { defaultIcons } from "./icons"
import { defaultLocalization } from "./localization"
import type {
  DataTableConfig,
  DataTableInstance,
  Density,
  UseDataTableOptions,
} from "./types"

/**
 * Core hook. Wraps `useReactTable` with MRT-flavoured defaults (row models,
 * auto-injected selection column, localization) and attaches our presentation
 * state + feature flags to the instance as `table.cnTable`. Returns the
 * enriched instance to hand to `<DataTable table={table} />`.
 *
 * Controlled data state (sorting/filtering/pagination/selection/visibility),
 * `manual*` server-side flags, and `getRowId` all pass straight through to
 * TanStack via the spread options. The presentation state is split into focused
 * hooks (`use-editing-state`, `use-column-filter-modes`, `use-global-filter-mode`,
 * `use-resolved-columns`, `use-page-reset-on-filter-change`); this hook wires
 * them together and assembles the `cnTable` config.
 */
export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>
): DataTableInstance<TData> {
  const {
    localization: localizationProp,
    icons: iconsProp,
    defaultDensity = "comfortable",
    defaultShowColumnFilters = false,
    isLoading = false,
    isSaving = false,
    showProgressBars: showProgressBarsProp,
    showSkeletons: showSkeletonsProp,
    showLoadingOverlay: showLoadingOverlayProp,
    enableFacetedValues = true,
    enableColumnActions = true,
    enableStickyHeader = true,
    enablePagination = true,
    positionPagination = "bottom",
    paginationDisplayMode = "default",
    columnFilterDisplayMode = "subheader",
    positionGlobalFilter = "right",
    positionToolbarAlertBanner = "top",
    positionToolbarDropZone = "top",
    positionActionsColumn = "last",
    positionExpandColumn = "first",
    selectAllMode = "page",
    enableSelectAll = true,
    enableTopToolbar = true,
    enableBottomToolbar = true,
    enableDensityToggle = true,
    enableFullscreenToggle = true,
    enableKeyboardNavigation = true,
    enableColumnFilterModes = true,
    enableFilterMatchHighlighting = true,
    enableGlobalFilter = true,
    enableGlobalFilterModes = true,
    enableGlobalFilterRankedResults = false,
    defaultGlobalFilterMode = "fuzzy",
    density: densityProp,
    onDensityChange,
    isFullscreen: isFullscreenProp,
    onIsFullscreenChange,
    showColumnFilters: showColumnFiltersProp,
    onShowColumnFiltersChange,
    globalFilterMode: globalFilterModeProp,
    onGlobalFilterModeChange,
    enableColumnOrdering = false,
    enableColumnPinning = false,
    enableColumnResizing = false,
    enableRowOrdering = false,
    enableRowPinning = false,
    enableRowNumbers = false,
    rowNumberMode = "static",
    onRowOrderChange,
    enableGrouping = false,
    enableExpanding: enableExpandingProp,
    enableStickyFooter = true,
    renderDetailPanel,
    enableEditing = false,
    editDisplayMode = "cell",
    createDisplayMode = "modal",
    createRowDefaults,
    enableClickToCopy = false,
    onEditCellSave,
    onSaveRow,
    onCreateRow,
    renderRowActions,
    renderCellActionMenuItems,
    renderRowActionMenuItems,
    renderColumnActionsMenuItems,
    renderColumnFilterModeMenuItems,
    renderGlobalFilterModeMenuItems,
    renderCaption,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    enableRowVirtualization = false,
    enableColumnVirtualization = false,
    estimateRowHeight = 52,
    virtualOverscan = 8,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    enableExport = false,
    exportFileName,
    enableToolbarInternalActions = true,
    title,
    renderToolbarActions,
    renderTopToolbar,
    renderBottomToolbar,
    renderToolbarInternalActions,
    renderBottomToolbarCustomActions,
    renderEmpty,
    columns,
    ...tableOptions
  } = options

  // App-wide defaults from a surrounding DataTableConfigProvider (if any) sit
  // between the built-in defaults and per-call options.
  const configCtx = useDataTableConfigContext()
  const localization = React.useMemo(
    () => ({
      ...defaultLocalization,
      ...configCtx.localization,
      ...localizationProp,
    }),
    [configCtx.localization, localizationProp]
  )
  const icons = React.useMemo(
    () => ({ ...defaultIcons, ...configCtx.icons, ...iconsProp }),
    [configCtx.icons, iconsProp]
  )

  // Expansion turns on for tree data (getSubRows), detail panels, or grouping.
  const enableExpanding =
    enableExpandingProp ??
    (!!renderDetailPanel || !!tableOptions.getSubRows || enableGrouping)
  // An expand column is needed for tree sub-rows or detail panels (grouped
  // rows carry their own chevron in the grouping cell).
  const needsExpandColumn = !!renderDetailPanel || !!tableOptions.getSubRows

  // Loading affordances: each can be forced on/off, else derived from the
  // loading/saving flags (progress bar for either; skeletons + overlay only
  // for the initial data load).
  const showProgressBars = showProgressBarsProp ?? (isLoading || isSaving)
  const showSkeletons = showSkeletonsProp ?? isLoading
  const showLoadingOverlay = showLoadingOverlayProp ?? isLoading

  const [density, setDensity] = useControllableState<Density>(
    densityProp,
    defaultDensity,
    onDensityChange
  )
  const [isFullscreen, setIsFullscreen] = useControllableState(
    isFullscreenProp,
    false,
    onIsFullscreenChange
  )
  const [showColumnFilters, setShowColumnFilters] = useControllableState(
    showColumnFiltersProp,
    defaultShowColumnFilters,
    onShowColumnFiltersChange
  )

  const {
    editingCell,
    setEditingCell,
    editingRowId,
    isCreating,
    rowDraft,
    setRowDraftValue,
    beginRowEdit,
    beginCreate,
    cancelEdit,
  } = useEditingState<TData>(createRowDefaults)

  const { columnFilterModes, setColumnFilterModes, dynamicFilterFn } =
    useColumnFilterModes<TData>(columns)

  const isManualFiltering = !!tableOptions.manualFiltering

  const {
    globalFilterMode,
    setGlobalFilterMode,
    dynamicGlobalFilterFn,
    rankedSortedRowModel,
  } = useGlobalFilterMode<TData>({
    globalFilterMode: globalFilterModeProp,
    defaultGlobalFilterMode,
    onGlobalFilterModeChange,
    enableGlobalFilterRankedResults,
    manualSorting: !!tableOptions.manualSorting,
    manualFiltering: isManualFiltering,
    enableGrouping,
  })

  const enableRowSelection =
    tableOptions.enableRowSelection != null
      ? !!tableOptions.enableRowSelection
      : false

  // Columns with a consumer-provided cell renderer are left untouched by
  // auto-highlighting (the consumer owns their markup).
  const columnsWithCustomCell = React.useMemo(() => {
    const set = new Set<string>()
    for (const def of columns) {
      const key = columnKey(def as { id?: string; accessorKey?: unknown })
      if (key && "cell" in def && def.cell != null) set.add(key)
    }
    return set
  }, [columns])

  const resolvedColumns = useResolvedColumns<TData>({
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
  })

  const table = useReactTable<TData>({
    ...tableOptions,
    columns: resolvedColumns,
    // Default page-reset off: TanStack's auto-reset runs a state update during
    // render (warns in React 19 dev). We reset on filter changes via an effect
    // below instead. Consumers can re-enable by passing the option explicitly.
    autoResetPageIndex: tableOptions.autoResetPageIndex ?? false,
    defaultColumn: {
      filterFn: dynamicFilterFn,
      ...tableOptions.defaultColumn,
    },
    enableGlobalFilter,
    globalFilterFn: tableOptions.globalFilterFn ?? dynamicGlobalFilterFn,
    enableColumnPinning,
    enableColumnResizing,
    columnResizeMode: tableOptions.columnResizeMode ?? "onChange",
    enableRowPinning,
    keepPinnedRows: tableOptions.keepPinnedRows ?? true,
    enableGrouping,
    enableExpanding,
    // Detail panels expand arbitrary rows; tree data uses getSubRows' own logic.
    getRowCanExpand:
      tableOptions.getRowCanExpand ??
      (renderDetailPanel ? () => true : undefined),
    getGroupedRowModel: enableGrouping
      ? (tableOptions.getGroupedRowModel ?? getGroupedRowModel())
      : tableOptions.getGroupedRowModel,
    getExpandedRowModel: enableExpanding
      ? (tableOptions.getExpandedRowModel ?? getExpandedRowModel())
      : tableOptions.getExpandedRowModel,
    getCoreRowModel: tableOptions.getCoreRowModel ?? getCoreRowModel(),
    getSortedRowModel: tableOptions.manualSorting
      ? tableOptions.getSortedRowModel
      : (tableOptions.getSortedRowModel ?? rankedSortedRowModel),
    getFilteredRowModel: isManualFiltering
      ? tableOptions.getFilteredRowModel
      : (tableOptions.getFilteredRowModel ?? getFilteredRowModel()),
    // Client-side faceting powers select/multi-select option lists + counts and
    // range-slider bounds. Skipped in manual mode (server supplies facets) or
    // when `enableFacetedValues` is off.
    getFacetedRowModel:
      isManualFiltering || !enableFacetedValues
        ? tableOptions.getFacetedRowModel
        : (tableOptions.getFacetedRowModel ?? getFacetedRowModel()),
    getFacetedUniqueValues:
      isManualFiltering || !enableFacetedValues
        ? tableOptions.getFacetedUniqueValues
        : (tableOptions.getFacetedUniqueValues ?? getFacetedUniqueValues()),
    getFacetedMinMaxValues:
      isManualFiltering || !enableFacetedValues
        ? tableOptions.getFacetedMinMaxValues
        : (tableOptions.getFacetedMinMaxValues ?? getFacetedMinMaxValues()),
    getPaginationRowModel:
      !enablePagination || tableOptions.manualPagination
        ? tableOptions.getPaginationRowModel
        : (tableOptions.getPaginationRowModel ?? getPaginationRowModel()),
  }) as DataTableInstance<TData>

  const enableColumnFilters = tableOptions.enableColumnFilters !== false

  usePageResetOnFilterChange(table, {
    enablePagination,
    manualPagination: tableOptions.manualPagination,
    autoResetPageIndex: tableOptions.autoResetPageIndex,
  })

  // Switching a column's mode resets its value so a stale value (e.g. a
  // numeric range left over from "between") can't break the new mode. Valueless
  // modes (empty/notEmpty) get a truthy sentinel so they stay active. Lives here
  // (not in useColumnFilterModes) because it needs the table instance.
  const setColumnFilterMode = React.useCallback(
    (columnId: string, mode: FilterMode) => {
      setColumnFilterModes((prev) => ({ ...prev, [columnId]: mode }))
      const column = table.getColumn(columnId)
      if (!column) return
      column.setFilterValue(VALUELESS_MODES.has(mode) ? mode : undefined)
    },
    [table, setColumnFilterModes]
  )

  // Structural DOM refs, exposed on `table.cnTable.refs` and attached to the
  // corresponding elements in DataTable / toolbar / global-filter.
  const tablePaperRef = React.useRef<HTMLDivElement>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const topToolbarRef = React.useRef<HTMLDivElement>(null)
  const bottomToolbarRef = React.useRef<HTMLDivElement>(null)
  const tableHeadRef = React.useRef<HTMLTableSectionElement>(null)
  const tableFooterRef = React.useRef<HTMLTableSectionElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const config: DataTableConfig<TData> = {
    localization,
    icons,
    refs: {
      tablePaperRef,
      tableContainerRef,
      topToolbarRef,
      bottomToolbarRef,
      tableHeadRef,
      tableFooterRef,
      searchInputRef,
    },
    density,
    setDensity,
    isFullscreen,
    setIsFullscreen,
    showColumnFilters,
    setShowColumnFilters,
    columnFilterModes,
    setColumnFilterMode,
    globalFilterMode,
    setGlobalFilterMode,
    enableGlobalFilter,
    enableGlobalFilterModes,
    isLoading,
    isSaving,
    showProgressBars,
    showSkeletons,
    showLoadingOverlay,
    enableFacetedValues,
    enableColumnActions,
    enableColumnFilters,
    enableColumnFilterModes,
    enableFilterMatchHighlighting,
    columnsWithCustomCell,
    enableColumnOrdering,
    enableColumnPinning,
    enableColumnResizing,
    enableRowOrdering,
    enableRowPinning,
    enableRowNumbers,
    rowNumberMode,
    onRowOrderChange,
    enableGrouping,
    enableExpanding,
    enableStickyFooter,
    renderDetailPanel,
    enableEditing,
    editDisplayMode,
    createDisplayMode,
    editingCell,
    setEditingCell,
    editingRowId,
    isCreating,
    rowDraft,
    setRowDraftValue,
    beginRowEdit,
    beginCreate,
    cancelEdit,
    enableClickToCopy,
    onEditCellSave,
    onSaveRow,
    onCreateRow,
    renderRowActions,
    renderCellActionMenuItems,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    enableRowVirtualization,
    enableColumnVirtualization,
    estimateRowHeight,
    virtualOverscan,
    rowVirtualizerOptions,
    columnVirtualizerOptions,
    rowVirtualizerInstanceRef,
    columnVirtualizerInstanceRef,
    enableExport,
    exportFileName,
    enableStickyHeader,
    enablePagination,
    positionPagination,
    paginationDisplayMode,
    columnFilterDisplayMode,
    positionGlobalFilter,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    enableRowSelection,
    enableTopToolbar,
    enableBottomToolbar,
    enableDensityToggle,
    enableFullscreenToggle,
    enableToolbarInternalActions,
    enableKeyboardNavigation,
    title,
    renderToolbarActions,
    renderTopToolbar,
    renderBottomToolbar,
    renderToolbarInternalActions,
    renderBottomToolbarCustomActions,
    renderRowActionMenuItems,
    renderColumnActionsMenuItems,
    renderColumnFilterModeMenuItems,
    renderGlobalFilterModeMenuItems,
    renderCaption,
    renderEmpty,
  }

  table.cnTable = config

  return table
}
