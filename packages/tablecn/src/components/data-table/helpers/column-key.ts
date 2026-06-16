/** Best-effort column id used to key per-column state (e.g. filter modes). */
export function columnKey(def: {
  id?: string
  accessorKey?: unknown
}): string | null {
  if (def.id) return def.id
  if (typeof def.accessorKey === "string") return def.accessorKey
  return null
}
