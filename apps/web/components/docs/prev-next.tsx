"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsFlatNav } from "@/lib/docs-nav"

/** Previous / next page links derived from the flattened nav order. */
export function DocsPrevNext() {
  const pathname = usePathname()
  const index = docsFlatNav.findIndex((i) => i.href === pathname)
  if (index === -1) return null

  const prev = index > 0 ? docsFlatNav[index - 1] : null
  const next =
    index < docsFlatNav.length - 1 ? docsFlatNav[index + 1] : null

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="flex flex-col gap-0.5 rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          <span className="text-xs text-muted-foreground">← Previous</span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex flex-col gap-0.5 rounded-md border px-4 py-2 text-right text-sm hover:bg-muted"
        >
          <span className="text-xs text-muted-foreground">Next →</span>
          <span className="font-medium">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
