import type { Metadata } from "next"

import { DocsPrevNext } from "@/components/docs/prev-next"
import { DocsSidebar } from "@/components/docs/sidebar"
import { SiteHeader } from "@/components/site-header"

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
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col md:flex-row">
        <aside className="hidden shrink-0 overflow-y-auto px-4 py-6 md:sticky md:top-[57px] md:block md:h-[calc(100svh-57px)] md:w-64 md:border-e">
          <DocsSidebar />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8 lg:px-16">
          <article className="mx-auto max-w-3xl">
            {children}
            <DocsPrevNext />
          </article>
        </main>
      </div>
    </div>
  )
}
