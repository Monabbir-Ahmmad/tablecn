const REASONS: { title: string; description: string }[] = [
  {
    title: "shadcn-native",
    description:
      "It only uses standard shadcn primitive APIs — button, table, popover, command — declared as registry dependencies. No Material UI, no design system to fight.",
  },
  {
    title: "You own the source",
    description:
      "The component is copied into your repo under components/ui/data-table/. No opaque dependency to wrap or patch — extend any line you like.",
  },
  {
    title: "Style-agnostic",
    description:
      "shadcn add installs the primitives in your configured style and base color, so the table adopts your look with nothing to override.",
  },
  {
    title: "One hook, one component",
    description:
      "useDataTable(options) returns an enriched TanStack instance; <DataTable table={table} /> renders it. If you know TanStack Table, you already know this.",
  },
]

/**
 * The differentiation pitch vs. MRT and raw TanStack: quiet bordered cards, no
 * color noise — the copy carries it.
 */
export function WhySection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Why this table
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            MRT is the most complete React table, but it&apos;s tied to Material
            UI. This brings that breadth to the shadcn/ui ecosystem.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {REASONS.map((reason, index) => (
            <div key={reason.title} className="border bg-card p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-sm text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold tracking-tight">
                  {reason.title}
                </h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
