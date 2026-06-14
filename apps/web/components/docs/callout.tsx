import { cn } from "@monabbir/tablecn/lib/utils"

type Variant = "note" | "tip" | "warning"

const STYLES: Record<Variant, string> = {
  note: "border-border bg-muted/40",
  tip: "border-emerald-500/30 bg-emerald-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
}

const LABELS: Record<Variant, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
}

/** A small admonition block for docs (note / tip / warning). */
export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("my-6 rounded-lg border px-4 py-3 text-sm", STYLES[variant])}>
      <p className="mb-1 font-medium">{title ?? LABELS[variant]}</p>
      <div className="text-muted-foreground [&_a]:underline [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
        {children}
      </div>
    </div>
  )
}
