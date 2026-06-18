"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

type TocEntry = { id: string; text: string }
type TocItem = TocEntry & { children: TocEntry[] }

function useTableOfContents(): { items: TocItem[]; activeId: string | null } {
  const pathname = usePathname()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const article = document.querySelector("[data-docs-article]")
    if (!article) return

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h2[id], h3[id]")
    )

    const built: TocItem[] = []
    for (const el of headings) {
      const entry: TocEntry = { id: el.id, text: el.textContent ?? "" }
      if (el.tagName === "H2") {
        built.push({ ...entry, children: [] })
      } else {
        const parent = built[built.length - 1]
        if (parent) {
          parent.children.push(entry)
        } else {
          built.push({ ...entry, children: [] })
        }
      }
    }
    setItems(built)
    setActiveId(built[0]?.id ?? null)

    if (headings.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          const first = visible[0]
          if (first) {
            setActiveId((first.target as HTMLElement).id)
          }
        },
        { rootMargin: "-10% 0% -80% 0%", threshold: 0 }
      )

      headings.forEach((h) => observer.observe(h))
      return () => observer.disconnect()
    }
  }, [pathname])

  return { items, activeId }
}

export function DocsTableOfContents() {
  const { items, activeId } = useTableOfContents()

  const totalHeadings = items.reduce((n, i) => n + 1 + i.children.length, 0)
  if (totalHeadings < 2) return null

  return (
    <nav aria-label="On this page">
      <p className="mb-4 text-sm font-medium">On this page</p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1 transition-colors hover:text-foreground",
                activeId === item.id
                  ? "border-l-2 border-primary pl-2 font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.text}
            </a>
            {item.children.length > 0 && (
              <ul className="mt-1 space-y-1 pl-4">
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={cn(
                        "block py-1 transition-colors hover:text-foreground",
                        activeId === child.id
                          ? "border-l-2 border-primary pl-2 font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
