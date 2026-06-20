"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"
import { EXAMPLES } from "@/components/examples/registry"

/**
 * The hero's live, tabbed table. Each tab renders a real example straight from
 * the shared examples registry, so the homepage never duplicates demo code.
 */
const DEMO_TABS: { slug: string; label: string }[] = [
  { slug: "basic", label: "Basic" },
  { slug: "column-filters", label: "Filtering" },
  { slug: "grouping", label: "Grouping" },
  { slug: "editing-row", label: "Editing" },
  { slug: "virtualized", label: "Virtualized" },
]

export function DemoShowcase({ className }: { className?: string }) {
  const [active, setActive] = React.useState(DEMO_TABS[0]!.slug)
  const example = EXAMPLES.find((e) => e.slug === active)
  const Component = example?.Component

  return (
    <div className={cn("overflow-hidden border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2 sm:px-3">
        <div
          role="tablist"
          aria-label="Live table demos"
          className="flex items-center overflow-x-auto"
        >
          {DEMO_TABS.map((tab) => {
            const selected = tab.slug === active
            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.slug)}
                className={cn(
                  "relative -mb-px shrink-0 border-b-2 px-3 py-3 text-xs font-semibold tracking-widest uppercase transition-colors",
                  selected
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <Link
          href="/docs"
          className="hidden shrink-0 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          All examples →
        </Link>
      </div>

      <div className="p-3 sm:p-4">
        {Component ? (
          <Component key={active} />
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Demo unavailable.
          </div>
        )}
      </div>
    </div>
  )
}
