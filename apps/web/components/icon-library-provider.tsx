"use client"

import * as React from "react"

import { DataTableConfigProvider } from "@monabbir/tablecn/components/data-table"

import { lucideIcons, type IconLibrary } from "@/components/examples/icon-sets"
import { readPrefs } from "@/lib/theme-store"

interface IconLibraryContextValue {
  iconLibrary: IconLibrary
  setIconLibrary: (lib: IconLibrary) => void
}

const IconLibraryContext =
  React.createContext<IconLibraryContextValue | null>(null)

/**
 * App-wide icon-library state. Mounted once at the root so the shared header
 * can toggle it and EVERY table (examples + docs embeds) picks it up through
 * the wrapping DataTableConfigProvider.
 */
export function IconLibraryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to "remix" for SSR + first client render to avoid a hydration
  // mismatch; sync the saved preference after mount.
  const [iconLibrary, setIconLibrary] = React.useState<IconLibrary>("remix")
  React.useEffect(() => {
    const saved = readPrefs().icons
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved !== "remix") setIconLibrary(saved)
  }, [])

  const value = React.useMemo(
    () => ({ iconLibrary, setIconLibrary }),
    [iconLibrary]
  )

  return (
    <IconLibraryContext.Provider value={value}>
      <DataTableConfigProvider
        icons={iconLibrary === "lucide" ? lucideIcons : undefined}
      >
        {children}
      </DataTableConfigProvider>
    </IconLibraryContext.Provider>
  )
}

export function useIconLibrary(): IconLibraryContextValue {
  const ctx = React.useContext(IconLibraryContext)
  if (!ctx) {
    throw new Error("useIconLibrary must be used within an IconLibraryProvider")
  }
  return ctx
}
