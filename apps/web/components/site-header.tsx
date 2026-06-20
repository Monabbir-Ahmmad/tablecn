"use client"

import { RiGithubFill } from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { DocsMobileNav } from "@/components/docs/mobile-nav"
import { DocsSearch } from "@/components/docs/search"
import { useIconLibrary } from "@/components/icon-library-provider"
import { ThemeCustomizer } from "@/components/theme-customizer"

const GITHUB_URL = "https://github.com/Monabbir-Ahmmad/shadcn-react-table"

/**
 * The shared top bar for the docs site: brand, primary nav (with active
 * state), and the theme customizer.
 */
export function SiteHeader() {
  const pathname = usePathname()
  const { iconLibrary, setIconLibrary } = useIconLibrary()

  const links = [
    {
      href: "/docs",
      label: "Docs",
      active: pathname?.startsWith("/docs") ?? true,
    },
  ]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3 md:gap-6">
        <div className="md:hidden">
          <DocsMobileNav />
        </div>
        <Link href="/" className="text-base font-semibold tracking-tight">
          Shadcn React Table
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
        <DocsSearch />
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
