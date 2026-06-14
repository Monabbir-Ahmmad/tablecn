"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiGithubFill } from "@remixicon/react"

import { Button } from "@monabbir/tablecn/components/button"
import { cn } from "@monabbir/tablecn/lib/utils"

import { useIconLibrary } from "@/components/icon-library-provider"
import { ThemeCustomizer } from "@/components/theme-customizer"

const GITHUB_URL = "https://github.com/Monabbir-Ahmmad/tablecn"

/**
 * The shared top bar for both the examples browser and the docs site: brand,
 * primary nav (with active state), and the theme customizer.
 *
 * The examples page owns the icon-library state (it feeds a
 * DataTableConfigProvider), so it passes `iconLibrary` / `onIconLibraryChange`
 * in. Elsewhere the header manages its own local state.
 */
export function SiteHeader() {
  const pathname = usePathname()
  const { iconLibrary, setIconLibrary } = useIconLibrary()

  const isDocs = pathname?.startsWith("/docs") ?? false

  const links = [
    { href: "/", label: "Examples", active: !isDocs },
    { href: "/docs", label: "Docs", active: isDocs },
  ]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          tablecn
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                link.active && "font-medium text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="GitHub repository"
        >
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            <RiGithubFill />
          </a>
        </Button>
        <ThemeCustomizer
          iconLibrary={iconLibrary}
          onIconLibraryChange={setIconLibrary}
        />
      </div>
    </header>
  )
}
