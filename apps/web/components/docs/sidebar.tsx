"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@monabbir/tablecn/lib/utils"
import { docsNav } from "@/lib/docs-nav"

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6">
      {docsNav.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <div className="px-2 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {group.title}
          </div>
          {group.items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-muted font-medium text-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
