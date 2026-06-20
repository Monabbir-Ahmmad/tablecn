import type { ComponentType } from "react"
import {
  RiArrowUpDownLine,
  RiDownloadLine,
  RiEdit2Line,
  RiFilter3Line,
  RiFlashlightLine,
  RiLayoutColumnLine,
  RiListCheck2,
  RiStackLine,
  RiTranslate2,
} from "@remixicon/react"

interface Feature {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: RiArrowUpDownLine,
    title: "Sorting",
    description:
      "Single and multi-column sorting with shift-click and order badges.",
  },
  {
    icon: RiFilter3Line,
    title: "Filtering & search",
    description:
      "Per-column filter row, switchable match modes, and fuzzy global search.",
  },
  {
    icon: RiLayoutColumnLine,
    title: "Column management",
    description: "Reorder, pin, resize, and toggle visibility of any column.",
  },
  {
    icon: RiStackLine,
    title: "Grouping & trees",
    description:
      "Group with aggregation footers, detail panels, and hierarchical sub-rows.",
  },
  {
    icon: RiEdit2Line,
    title: "Inline editing",
    description: "Edit by cell, row, table, or modal with create and save hooks.",
  },
  {
    icon: RiListCheck2,
    title: "Rows & selection",
    description:
      "Selection, row numbers, pinning, drag-to-reorder, and row actions.",
  },
  {
    icon: RiFlashlightLine,
    title: "Virtualization",
    description:
      "Row and column virtualization keep thousands of rows smooth.",
  },
  {
    icon: RiDownloadLine,
    title: "Export",
    description: "Export selected or filtered rows to CSV and Excel.",
  },
  {
    icon: RiTranslate2,
    title: "Localization & icons",
    description: "Override every string and swap in your own icon set.",
  },
]

/**
 * The breadth pitch: a sharp-cornered grid of headline capabilities that maps
 * one-to-one onto the docs guides.
 */
export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Everything Material React Table does
        </h2>
        <p className="mt-4 text-muted-foreground text-pretty">
          The full breadth of MRT, rebuilt on TanStack Table v8 and driven by a
          single hook — nothing bolted on.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group bg-card p-6 transition-colors hover:bg-muted/40"
          >
            <feature.icon className="size-5 text-primary" />
            <h3 className="mt-4 text-sm font-semibold tracking-wide uppercase">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
