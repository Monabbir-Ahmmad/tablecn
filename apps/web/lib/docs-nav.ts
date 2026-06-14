export interface DocsNavItem {
  title: string
  href: string
}

export interface DocsNavGroup {
  title: string
  items: DocsNavItem[]
}

/**
 * Single source of truth for the docs sidebar + ordering. Each `href` maps to
 * an `app/docs/.../page.mdx` route.
 */
export const docsNav: DocsNavGroup[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick start", href: "/docs/quick-start" },
      { title: "Usage", href: "/docs/usage" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Sorting", href: "/docs/guides/sorting" },
      { title: "Column filtering", href: "/docs/guides/column-filtering" },
      { title: "Filter modes", href: "/docs/guides/filter-modes" },
      { title: "Global search", href: "/docs/guides/global-search" },
      { title: "Column ordering", href: "/docs/guides/column-ordering" },
      { title: "Column pinning", href: "/docs/guides/column-pinning" },
      { title: "Column resizing", href: "/docs/guides/column-resizing" },
      { title: "Column visibility", href: "/docs/guides/column-visibility" },
      { title: "Density", href: "/docs/guides/density" },
      { title: "Sticky header & footer", href: "/docs/guides/sticky" },
      { title: "Loading state", href: "/docs/guides/loading" },
      { title: "Row selection", href: "/docs/guides/row-selection" },
      { title: "Row numbers", href: "/docs/guides/row-numbers" },
      { title: "Row pinning", href: "/docs/guides/row-pinning" },
      { title: "Row ordering", href: "/docs/guides/row-ordering" },
      { title: "Grouping & aggregation", href: "/docs/guides/grouping" },
      { title: "Detail panel", href: "/docs/guides/detail-panel" },
      { title: "Tree data", href: "/docs/guides/tree" },
      { title: "Editing", href: "/docs/guides/editing" },
      { title: "Row actions", href: "/docs/guides/row-actions" },
      { title: "Cell actions", href: "/docs/guides/cell-actions" },
      { title: "Virtualization", href: "/docs/guides/virtualization" },
      { title: "Export", href: "/docs/guides/export" },
      { title: "Localization", href: "/docs/guides/localization" },
      { title: "Custom icons", href: "/docs/guides/custom-icons" },
      { title: "Event listeners", href: "/docs/guides/event-listeners" },
      { title: "Server-side data", href: "/docs/guides/server-side" },
      { title: "Theming", href: "/docs/guides/theming" },
    ],
  },
  {
    title: "API reference",
    items: [
      { title: "useDataTable options", href: "/docs/api/use-data-table" },
      { title: "Column options", href: "/docs/api/column-options" },
      { title: "DataTable props", href: "/docs/api/data-table-props" },
      { title: "Table instance", href: "/docs/api/table-instance" },
      { title: "Localization", href: "/docs/api/localization" },
      { title: "Icons", href: "/docs/api/icons" },
    ],
  },
]

/** Flattened, in-order list for prev/next navigation. */
export const docsFlatNav: DocsNavItem[] = docsNav.flatMap((g) => g.items)
