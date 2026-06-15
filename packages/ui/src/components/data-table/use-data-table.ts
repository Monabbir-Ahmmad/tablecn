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
  getSortedRowModel,
  useReactTable,
  type Row,
  type RowData,
} from "@tanstack/react-table"

import {
  createDynamicFilterFn,
  createGlobalFilterFn,
  defaultModeForVariant,
  VALUELESS_MODES,
  type FilterMode,
  type GlobalFilterMode,
} from "./filter-fns"
import {
  createExpandColumn,
  createRowDragHandleColumn,
  createRowNumberColumn,
} from "./display-columns"
import { createRowActionsColumn } from "./data-table-row-actions"
import { useDataTableConfigContext } from "./config-context"
import { defaultIcons } from "./icons"
import { defaultLocalization } from "./localization"
import { createSelectionColumn } from "./selection-column"
import type {
  DataTableConfig,
  DataTableInstance,
  Density,
  EditingCell,
  UseDataTableOptions,
} from "./types"

/** Best-effort column id used to key per-column filter modes. */
function columnKey(def: { id?: string; accessorKey?: unknown }): string | null {
  if (def.id) return def.id
  if (typeof def.accessorKey === "string") return def.accessorKey
  return null
}

/**
 * State that is uncontrolled by default but becomes controlled when a value is
 * supplied. Either way `onChange` fires, so consumers can observe a change
 * without taking over ownership. Returns the same tuple shape as `useState` so
 * existing `Dispatch<SetStateAction<T>>` consumers keep working.
 */
function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (next) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange, value]
  )

  return [value, setValue]
}

/**
 * Core hook. Wraps `useReactTable` with MRT-flavoured defaults (row models,
 * auto-injected selection column, localization) and attaches our presentation
 * state + feature flags to the instance as `table.cnTable`. Returns the
 * enriched instance to hand to `<DataTable table={table} />`.
 *
 * Controlled data state (sorting/filtering/pagination/selection/visibility),
 * `manual*` server-side flags, and `getRowId` all pass straight through to
 * TanStack via the spread options.
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
  const [columnFilterModes, setColumnFilterModes] = React.useState<
    Record<string, FilterMode>
  >({})

  // Editing state
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null)
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [rowDraft, setRowDraft] = React.useState<Record<string, unknown>>({})

  const setRowDraftValue = React.useCallback(
    (columnId: string, value: unknown) =>
      setRowDraft((prev) => ({ ...prev, [columnId]: value })),
    []
  )

  const beginRowEdit = React.useCallback((row: Row<TData>) => {
    const draft: Record<string, unknown> = {}
    for (const cell of row.getAllCells()) {
      if (cell.column.accessorFn != null) {
        draft[cell.column.id] = cell.getValue()
      }
    }
    setRowDraft(draft)
    setEditingRowId(row.id)
    setIsCreating(false)
    setEditingCell(null)
  }, [])

  const beginCreate = React.useCallback(() => {
    setRowDraft(createRowDefaults ? { ...createRowDefaults } : {})
    setIsCreating(true)
    setEditingRowId(null)
    setEditingCell(null)
  }, [createRowDefaults])

  const cancelEdit = React.useCallback(() => {
    setEditingCell(null)
    setEditingRowId(null)
    setIsCreating(false)
    setRowDraft({})
  }, [])

  // Per-column default mode derived from `meta.filterMode` / `meta.variant`.
  const defaultModes = React.useMemo(() => {
    const map: Record<string, FilterMode> = {}
    for (const def of columns) {
      const key = columnKey(def as { id?: string; accessorKey?: unknown })
      if (!key) continue
      const meta = def.meta
      map[key] =
        meta?.filterMode ?? defaultModeForVariant(meta?.variant ?? "text")
    }
    return map
  }, [columns])

  // Refs let the dynamic filterFn read current modes without re-creating its
  // identity (which would thrash the filtered row model on every render).
  const modesRef = React.useRef(columnFilterModes)
  modesRef.current = columnFilterModes
  const defaultModesRef = React.useRef(defaultModes)
  defaultModesRef.current = defaultModes

  const getColumnMode = React.useCallback(
    (columnId: string): FilterMode =>
      modesRef.current[columnId] ??
      defaultModesRef.current[columnId] ??
      "contains",
    []
  )

  const dynamicFilterFn = React.useMemo(
    () => createDynamicFilterFn<TData>(getColumnMode),
    [getColumnMode]
  )

  const [globalFilterMode, setGlobalFilterMode] =
    useControllableState<GlobalFilterMode>(
      globalFilterModeProp,
      defaultGlobalFilterMode,
      onGlobalFilterModeChange
    )
  // Recreating the fn when the mode changes gives it a new identity, which
  // makes TanStack re-run global filtering with the new mode immediately.
  const dynamicGlobalFilterFn = React.useMemo(
    () => createGlobalFilterFn<TData>(() => globalFilterMode),
    [globalFilterMode]
  )

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

  // Inject display columns once, memoized so we don't hand TanStack a new
  // `columns` identity every render (a classic infinite-loop / lost-state trap).
  // Leading order: drag handle → selection → expand → row number → user columns.
  // The expand and row-actions columns can be moved to the trailing/leading edge
  // via `positionExpandColumn` / `positionActionsColumn`.
  const resolvedColumns = React.useMemo(() => {
    const leading = []
    const trailing = []
    if (enableRowOrdering) {
      leading.push(createRowDragHandleColumn<TData>(localization, icons))
    }
    if (enableRowSelection) {
      leading.push(
        createSelectionColumn<TData>(
          localization,
          selectAllMode,
          enableSelectAll
        )
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
      const actions = createRowActionsColumn<TData>()
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

  const isManualFiltering = !!tableOptions.manualFiltering

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
      : (tableOptions.getSortedRowModel ?? getSortedRowModel()),
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

  // Clamp to the first page when the filter set changes (MRT behaviour),
  // replacing TanStack's render-phase auto-reset. Runs after mount so there is
  // no state update during render. Skipped in manual pagination (server owns it)
  // and when the consumer opted into the native auto-reset.
  const columnFiltersKey = JSON.stringify(table.getState().columnFilters)
  const globalFilterValue = table.getState().globalFilter
  const didMountRef = React.useRef(false)
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (
      enablePagination &&
      !tableOptions.manualPagination &&
      tableOptions.autoResetPageIndex == null
    ) {
      table.setPageIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFiltersKey, globalFilterValue])

  // Switching a column's mode resets its value so a stale value (e.g. a
  // numeric range left over from "between") can't break the new mode. Valueless
  // modes (empty/notEmpty) get a truthy sentinel so they stay active.
  const setColumnFilterMode = React.useCallback(
    (columnId: string, mode: FilterMode) => {
      setColumnFilterModes((prev) => ({ ...prev, [columnId]: mode }))
      const column = table.getColumn(columnId)
      if (!column) return
      column.setFilterValue(VALUELESS_MODES.has(mode) ? mode : undefined)
    },
    [table]
  )

  const config: DataTableConfig<TData> = {
    localization,
    icons,
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
