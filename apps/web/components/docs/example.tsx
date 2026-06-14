"use client"

import * as React from "react"

import { EXAMPLES } from "@/components/examples/registry"

/**
 * Embeds a live example from the shared example registry by slug, so docs and
 * the examples browser render the exact same component. Remounts on slug change
 * for a clean state.
 */
export function Example({ slug }: { slug: string }) {
  const example = EXAMPLES.find((e) => e.slug === slug)

  if (!example) {
    return (
      <div className="my-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Unknown example: <code className="font-mono">{slug}</code>
      </div>
    )
  }

  const Component = example.Component
  return (
    <div className="my-6 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium">{example.title}</span>
        <a
          href={`/#${example.slug}`}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Open in examples ↗
        </a>
      </div>
      <div className="p-4">
        <Component />
      </div>
    </div>
  )
}
