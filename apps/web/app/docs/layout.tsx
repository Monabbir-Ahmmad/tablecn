import type { Metadata } from "next"
import Link from "next/link"

import { DocsThemeControl } from "@/components/docs/header-actions"
import { DocsPrevNext } from "@/components/docs/prev-next"
import { DocsSidebar } from "@/components/docs/sidebar"

export const metadata: Metadata = {
  title: { default: "Docs", template: "%s — tablecn" },
  description:
    "Documentation for tablecn, a shadcn/ui data table with Material React Table parity.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-base font-semibold tracking-tight">
            tablecn
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/" className="hover:text-foreground">
              Examples
            </Link>
          </nav>
        </div>
        <DocsThemeControl />
      </header>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col md:flex-row">
        <aside className="shrink-0 overflow-y-auto border-b px-4 py-6 md:sticky md:top-[57px] md:h-[calc(100svh-57px)] md:w-64 md:border-e md:border-b-0">
          <DocsSidebar />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 md:px-10 lg:px-16">
          <article className="mx-auto max-w-3xl">
            {children}
            <DocsPrevNext />
          </article>
        </main>
      </div>
    </div>
  )
}
