"use client"

import * as React from "react"

import type { IconLibrary } from "@/components/examples/icon-sets"
import { ThemeCustomizer } from "@/components/theme-customizer"

/**
 * The docs header's theme control. Reuses the examples-page customizer (accent,
 * base color, font, radius, mode), with local icon-library state so the toggle
 * stays functional. Docs example embeds use the package default icon set.
 */
export function DocsThemeControl() {
  const [iconLibrary, setIconLibrary] = React.useState<IconLibrary>("remix")
  return (
    <ThemeCustomizer
      iconLibrary={iconLibrary}
      onIconLibraryChange={setIconLibrary}
    />
  )
}
