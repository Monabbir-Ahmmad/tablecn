import Link from "next/link"

const GITHUB_URL = "https://github.com/Monabbir-Ahmmad/shadcn-react-table"

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Getting started",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Quick start", href: "/docs/quick-start" },
      { label: "Usage", href: "/docs/usage" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Filtering", href: "/docs/guides/column-filtering" },
      { label: "Grouping", href: "/docs/guides/grouping" },
      { label: "Editing", href: "/docs/guides/editing" },
      { label: "Virtualization", href: "/docs/guides/virtualization" },
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "useDataTable options", href: "/docs/api/use-data-table" },
      { label: "DataTable props", href: "/docs/api/data-table-props" },
      { label: "Table instance", href: "/docs/api/table-instance" },
      { label: "Theming", href: "/docs/guides/theming" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-semibold tracking-tight">
              Shadcn React Table
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A shadcn/ui data table with Material React Table parity, built on
              TanStack Table v8.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {column.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            Built with shadcn/ui and TanStack Table. MIT licensed.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
