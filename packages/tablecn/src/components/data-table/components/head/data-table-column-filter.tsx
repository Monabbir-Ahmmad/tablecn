"use client"

import type { Header, RowData } from "@tanstack/react-table"

import { DataTableFilterModeMenu } from "../menus/data-table-filter-mode-menu"
import {
  CheckboxFilterField,
  DateFilterField,
  DateRangeFilterField,
  MultiSelectFilterField,
  NumberFilterField,
  RangeSliderFilterField,
  SelectFilterField,
  TextFilterField,
  type FilterFieldProps,
} from "./filter-variants"
import type { DataTableInstance } from "../../core/types"

interface DataTableColumnFilterProps<TData extends RowData, TValue> {
  header: Header<TData, TValue>
  table: DataTableInstance<TData>
}

/**
 * One filter-row field. Reads `column.meta.variant` and renders the matching
 * control, preceded by the filter-mode menu (where the variant supports modes).
 * `meta.renderColumnFilter` is an escape hatch for fully custom UI. Returns an
 * empty placeholder for non-filterable columns so the grid stays aligned.
 */
export function DataTableColumnFilter<TData extends RowData, TValue>({
  header,
  table,
}: DataTableColumnFilterProps<TData, TValue>) {
  const { column } = header

  if (header.isPlaceholder || !column.getCanFilter()) {
    return <div className="h-8" />
  }

  const custom = column.columnDef.meta?.renderColumnFilter
  if (custom) {
    return <>{custom({ column, table })}</>
  }

  return (
    <div className="flex items-center gap-0.5">
      <DataTableFilterModeMenu column={column} table={table} />
      <div className="min-w-0 flex-1">
        <FilterField column={column} table={table} />
      </div>
    </div>
  )
}

function FilterField<TData extends RowData, TValue>({
  column,
  table,
}: FilterFieldProps<TData, TValue>) {
  const variant = column.columnDef.meta?.variant ?? "text"
  switch (variant) {
    case "select":
      return <SelectFilterField column={column} table={table} />
    case "multi-select":
      return <MultiSelectFilterField column={column} table={table} />
    case "checkbox":
      return <CheckboxFilterField column={column} table={table} />
    case "range":
      return <NumberFilterField column={column} table={table} />
    case "range-slider":
      return <RangeSliderFilterField column={column} table={table} />
    case "date":
      return <DateFilterField column={column} table={table} />
    case "date-range":
      return <DateRangeFilterField column={column} table={table} />
    default:
      return <TextFilterField column={column} table={table} />
  }
}
