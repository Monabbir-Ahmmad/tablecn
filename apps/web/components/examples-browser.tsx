"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@monabbir/tablecn/components/button"
import { DataTableConfigProvider } from "@monabbir/tablecn/components/data-table"
import { cn } from "@monabbir/tablecn/lib/utils"

import { EXAMPLES, type ExampleDef } from "./examples/registry"
import { lucideIcons, type IconLibrary } from "./examples/icon-sets"
import { ThemeCustomizer } from "./theme-customizer"
import { readPrefs } from "@/lib/theme-store"

const CATEGORY_ORDER = [
  "Basics",
  "Filtering",
  "Columns",
  "Display",
  "Selection & rows",
  "Grouping & trees",
  "Editing",
  "Actions",
  "Data",
]

function groupByCategory(items: ExampleDef[]) {
  const map = new Map<string, ExampleDef[]>()
  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
    category,
    items: map.get(category)!,
  }))
}

export function ExamplesBrowser() {
  const [slug, setSlug] = React.useState(EXAMPLES[0]!.slug)
  // Default to "remix" for SSR + first client render to avoid an icon
  // hydration mismatch; sync the saved preference after mount.
  const [iconLibrary, setIconLibrary] = React.useState<IconLibrary>("remix")
  React.useEffect(() => {
    const saved = readPrefs().icons
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved !== "remix") setIconLibrary(saved)
  }, [])
  const groups = React.useMemo(() => groupByCategory(EXAMPLES), [])
  const active = EXAMPLES.find((e) => e.slug === slug) ?? EXAMPLES[0]!
  const ActiveComponent = active.Component

  // Reflect the selection in the URL hash so examples are linkable.
  React.useEffect(() => {
    const fromHash = window.location.hash.slice(1)
    if (fromHash && EXAMPLES.some((e) => e.slug === fromHash)) {
      // Deep-link sync on mount (client-only; SSR renders the default).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlug(fromHash)
    }
  }, [])
  React.useEffect(() => {
    if (window.location.hash.slice(1) !== slug) {
      window.history.replaceState(null, "", `#${slug}`)
    }
  }, [slug])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
        <div>
          <h1 className="text-base font-semibold tracking-tight">tablecn</h1>
          <p className="text-xs text-muted-foreground">
            A shadcn/ui data table with Material React Table parity — feature
            examples.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <ThemeCustomizer
            iconLibrary={iconLibrary}
            onIconLibraryChange={setIconLibrary}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <nav className="shrink-0 overflow-y-auto border-b md:w-60 md:border-e md:border-b-0">
          <div className="flex flex-col gap-4 p-3">
            {groups.map((group) => (
              <div key={group.category} className="flex flex-col gap-0.5">
                <div className="px-2 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {group.category}
                </div>
                {group.items.map((example) => (
                  <Button
                    key={example.slug}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSlug(example.slug)}
                    aria-current={example.slug === slug ? "page" : undefined}
                    className={cn(
                      "h-8 justify-start px-2 text-left text-xs font-normal normal-case tracking-normal",
                      example.slug === slug &&
                        "bg-muted font-medium text-foreground"
                    )}
                  >
                    {example.title}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {active.title}
            </h2>
            <p className="text-sm text-muted-foreground">{active.description}</p>
          </div>
          {/* Remount per example so each starts from a clean state. */}
          <DataTableConfigProvider
            icons={iconLibrary === "lucide" ? lucideIcons : undefined}
          >
            <ActiveComponent key={active.slug} />
          </DataTableConfigProvider>
        </main>
      </div>
    </div>
  )
}
