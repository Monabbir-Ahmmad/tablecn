import * as generated from "@/lib/api-reference.generated"
import type { ApiMember } from "@/lib/api-reference.generated"

type SectionKey = keyof typeof generated

const SECTIONS = generated as Record<string, ApiMember[]>

/**
 * Renders an auto-generated API reference table. `of` selects one of the
 * exported arrays in `lib/api-reference.generated.ts` (rebuilt by
 * `pnpm --filter tablecn-web api:build`). `propLabel` lets the header read
 * "Option" / "Prop" / "Key" / "Slot" per section.
 */
export function ApiTable({
  of,
  propLabel = "Prop",
}: {
  of: SectionKey
  propLabel?: string
}) {
  const rows = SECTIONS[of] ?? []

  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">{propLabel}</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Default</th>
            <th className="px-3 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b align-top last:border-0">
              <td className="px-3 py-2 whitespace-nowrap">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {row.name}
                  {!row.required && (
                    <span className="text-muted-foreground">?</span>
                  )}
                </code>
              </td>
              <td className="px-3 py-2">
                <code className="font-mono text-xs text-muted-foreground">
                  {row.type}
                </code>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {row.default != null ? (
                  <code className="font-mono text-xs">{row.default}</code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {row.description || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
