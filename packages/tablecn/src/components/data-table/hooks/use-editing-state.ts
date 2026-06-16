"use client"

import * as React from "react"
import type { Row, RowData } from "@tanstack/react-table"

import type { EditingCell } from "../core/types"

export interface EditingState<TData extends RowData> {
  editingCell: EditingCell | null
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>
  editingRowId: string | null
  isCreating: boolean
  rowDraft: Record<string, unknown>
  setRowDraftValue: (columnId: string, value: unknown) => void
  beginRowEdit: (row: Row<TData>) => void
  beginCreate: () => void
  cancelEdit: () => void
}

/**
 * Inline editing / create-form state machine. Tracks which cell or row is being
 * edited (and whether the create form is open) plus the draft values, and
 * exposes the transitions to enter/leave those states. The draft is seeded from
 * the row's accessor cells on edit, or from `createRowDefaults` on create.
 */
export function useEditingState<TData extends RowData>(
  createRowDefaults?: Record<string, unknown>
): EditingState<TData> {
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

  return {
    editingCell,
    setEditingCell,
    editingRowId,
    isCreating,
    rowDraft,
    setRowDraftValue,
    beginRowEdit,
    beginCreate,
    cancelEdit,
  }
}
