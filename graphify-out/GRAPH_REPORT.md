# Graph Report - cn-table  (2026-06-14)

## Corpus Check
- 98 files · ~49,517 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 824 nodes · 1667 edges · 54 communities (39 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b39fd10`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Set & Roadmap|Feature Set & Roadmap]]
- [[_COMMUNITY_Core Render & Injected Columns|Core Render & Injected Columns]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Demo App & Monorepo Wiring|Demo App & Monorepo Wiring]]
- [[_COMMUNITY_shadcn Primitives & Styling|shadcn Primitives & Styling]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Cell Rendering & Highlighting|Cell Rendering & Highlighting]]
- [[_COMMUNITY_App Shell & Theming|App Shell & Theming]]
- [[_COMMUNITY_Root & Web Config|Root & Web Config]]
- [[_COMMUNITY_Toolbar Controls|Toolbar Controls]]
- [[_COMMUNITY_Workspace Packages & Build|Workspace Packages & Build]]
- [[_COMMUNITY_CSV  Excel Export|CSV / Excel Export]]
- [[_COMMUNITY_TypeScript Config Presets|TypeScript Config Presets]]
- [[_COMMUNITY_Column Pinning & Resizing Styles|Column Pinning & Resizing Styles]]
- [[_COMMUNITY_CommandDialog|CommandDialog]]
- [[_COMMUNITY_AGENTS.md Next.js Agent Rules|AGENTS.md Next.js Agent Rules]]
- [[_COMMUNITY_Column Actions Menu|Column Actions Menu]]
- [[_COMMUNITY_Density (3-level cycle)|Density (3-level cycle)]]
- [[_COMMUNITY_Keyboard Cell Navigation|Keyboard Cell Navigation]]
- [[_COMMUNITY_Localization (i18n string table)|Localization (i18n string table)]]
- [[_COMMUNITY_Pagination + Range Label|Pagination + Range Label]]
- [[_COMMUNITY_Row Selection (multi + single)|Row Selection (multi + single)]]
- [[_COMMUNITY_Top Toolbar + Alert Banner + Drop-to-Group Zone|Top Toolbar + Alert Banner + Drop-to-Group Zone]]
- [[_COMMUNITY_Checkbox|Checkbox]]
- [[_COMMUNITY_Command|Command]]
- [[_COMMUNITY_getColumnSizeVars|getColumnSizeVars]]
- [[_COMMUNITY_getColumnWidthStyle|getColumnWidthStyle]]
- [[_COMMUNITY_ExportOptions|ExportOptions]]
- [[_COMMUNITY_IconComponent|IconComponent]]
- [[_COMMUNITY_CellEvent|CellEvent]]
- [[_COMMUNITY_DataTableFilterOption|DataTableFilterOption]]
- [[_COMMUNITY_DataTableSlotProps|DataTableSlotProps]]
- [[_COMMUNITY_Density|Density]]
- [[_COMMUNITY_EditDisplayMode|EditDisplayMode]]
- [[_COMMUNITY_EditingCell|EditingCell]]
- [[_COMMUNITY_EditVariant|EditVariant]]
- [[_COMMUNITY_RowEvent|RowEvent]]
- [[_COMMUNITY_@workspaceeslint-config|@workspace/eslint-config]]
- [[_COMMUNITY_OrgNode|OrgNode]]
- [[_COMMUNITY_User|User]]
- [[_COMMUNITY_Graphify pre-tool hook|Graphify pre-tool hook]]
- [[_COMMUNITY_@workspacetypescript-config|@workspace/typescript-config]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 132 edges
2. `useDataTable()` - 50 edges
3. `useUserColumns()` - 31 edges
4. `DataTableInstance` - 30 edges
5. `Button()` - 23 edges
6. `getColumnLabel()` - 22 edges
7. `3. Design language — full MRT UI layout parity` - 18 edges
8. `compilerOptions` - 15 edges
9. `DataTable()` - 14 edges
10. `DataTableLocalization` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Swatch()` --calls--> `cn()`  [EXTRACTED]
  apps/web/components/theme-customizer.tsx → packages/ui/src/lib/utils.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  apps/web/app/layout.tsx → packages/ui/src/lib/utils.ts
- `ColumnVirtualizationExample()` --calls--> `useDataTable()`  [EXTRACTED]
  apps/web/components/examples/registry.tsx → packages/ui/src/components/data-table/use-data-table.ts
- `TreeExample()` --calls--> `useDataTable()`  [EXTRACTED]
  apps/web/components/examples/registry.tsx → packages/ui/src/components/data-table/use-data-table.ts
- `ContextMenuContent()` --semantically_similar_to--> `DropdownMenuContent()`  [INFERRED] [semantically similar]
  packages/ui/src/components/context-menu.tsx → packages/ui/src/components/dropdown-menu.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Registry distribution stack** — cn_table_shadcn_registry, cn_table_tailwind_v4, cn_table_token_theming, cn_table_registry_granularity [INFERRED 0.85]
- **Core DataTable runtime (hook + component + TanStack)** — datatable_readme_usedatatable, datatable_readme_datatable_component, cn_table_tanstack_table_v8, datatable_readme_cntable_namespace [EXTRACTED 1.00]
- **Examples demo render flow: Page -> ExamplesBrowser -> registry renders DataTable** — app_page_page, examples_browser_examplesbrowser, registry_examples, ui_components_datatable [INFERRED 0.85]
- **User data pipeline: makeUsers produces User rows consumed by userColumns and useDataTable examples** — example_data_makeusers, example_data_user, columns_usercolumns, registry_examples [INFERRED 0.85]
- **ESLint config inheritance chain: web config -> nextJsConfig -> base config** — eslint_config_web, next_nextjsconfig, base_config [INFERRED 0.95]
- **Glassmorphic translucent menu surfaces** — components_dropdown_menu_dropdownmenucontent, components_dropdown_menu_dropdownmenusubcontent, components_context_menu_contextmenucontent, components_context_menu_contextmenusubcontent [INFERRED 0.85]
- **cva variant-driven components** — components_badge_badgevariants, components_button_buttonvariants, components_input_group_inputgroupbutton [INFERRED 0.75]
- **tsconfig extends chain from base** — typescript_config_base, typescript_config_react_library, ui_tsconfig [INFERRED 0.95]
- **Filter-row variant fields (edit a column filter value)** — data_table_data_table_filter_variants_textfilterfield, data_table_data_table_filter_variants_numberfilterfield, data_table_data_table_filter_variants_selectfilterfield, data_table_data_table_filter_variants_multiselectfilterfield, data_table_data_table_filter_variants_checkboxfilterfield, data_table_data_table_filter_variants_rangesliderfilterfield, data_table_data_table_filter_variants_datefilterfield, data_table_data_table_filter_variants_daterangefilterfield [INFERRED 0.85]
- **Inline cell/row/modal editing pipeline** — data_table_data_table_edit_cell_datatablebodycellcontent, data_table_data_table_edit_field_datatableeditfield, data_table_data_table_edit_modal_datatableeditmodal [INFERRED 0.85]
- **Column header + per-column actions menu** — data_table_data_table_column_header_datatablecolumnheader, data_table_data_table_column_actions_datatablecolumnactions, data_table_data_table_column_filter_datatablecolumnfilter [INFERRED 0.85]
- **Auto-injected display column factories** — data_table_selection_column_createselectioncolumn, data_table_display_columns_createrownumbercolumn, data_table_data_table_row_actions_createrowactionscolumn [INFERRED 0.85]
- **Core trio: useDataTable + DataTable + types contracts** — data_table_use_data_table_usedatatable, data_table_data_table_datatable, data_table_types_datatableconfig [INFERRED 0.85]
- **Dynamic filter engine** — data_table_filter_fns_createdynamicfilterfn, data_table_filter_fns_createglobalfilterfn, data_table_filter_fns_mode_fns [INFERRED 0.85]

## Communities (54 total, 15 thin omitted)

### Community 0 - "Feature Set & Roadmap"
Cohesion: 0.07
Nodes (34): Click-to-Copy, Column Filtering (row, modes, variants), Column & Row Ordering (DnD), Column Pinning / Freezing, Column Resizing, @dnd-kit (DnD ordering), Editing Modes (cell/row/table/modal/custom), CSV / Excel Export (+26 more)

### Community 1 - "Core Render & Injected Columns"
Cohesion: 0.07
Nodes (57): DataTableConfigContext, DataTableConfigContextValue, DataTableConfigProvider(), useDataTableConfigContext(), DataTable(), DataTableBodyRow(), DataTableExportMenu(), DataTableDropToGroupZone() (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (25): Checkbox(), Slider(), DataTableColumnActions(), getColumnLabel(), DataTableColumnFilter(), DataTableColumnFilterProps, FilterField(), DataTableColumnHeader() (+17 more)

### Community 3 - "Demo App & Monorepo Wiring"
Cohesion: 0.06
Nodes (64): shadcn components.json config, useDataTable(), orgData (tree fixture), OrgNode data shape, User data shape, currency, dateFmt, DEPARTMENT_OPTIONS (+56 more)

### Community 4 - "shadcn Primitives & Styling"
Cohesion: 0.11
Nodes (35): Badge(), badgeVariants, Button(), buttonVariants, Calendar(), CalendarDayButton(), DropdownMenu(), DropdownMenuCheckboxItem() (+27 more)

### Community 6 - "Cell Rendering & Highlighting"
Cohesion: 0.10
Nodes (28): Skeleton(), Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader() (+20 more)

### Community 7 - "App Shell & Theming"
Cohesion: 0.18
Nodes (8): geist, geistMono, notoSerif, raleway, RootLayout(), ThemeProvider(), ThemeHotkey (press d), ThemeProvider

### Community 8 - "Root & Web Config"
Cohesion: 0.33
Nodes (6): Shared base ESLint config, Web ESLint config (nextJsConfig), Root ESLint config, nextJsConfig (eslint), Root tsconfig, Web tsconfig (path aliases)

### Community 9 - "Toolbar Controls"
Cohesion: 0.08
Nodes (25): CATEGORY_ORDER, ExamplesBrowser(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger() (+17 more)

### Community 10 - "Workspace Packages & Build"
Cohesion: 0.07
Nodes (25): config, nextJsConfig, devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-only-warn, eslint-plugin-react (+17 more)

### Community 12 - "CSV / Excel Export"
Cohesion: 0.05
Nodes (36): cn-table root workspace, devDependencies, prettier, prettier-plugin-tailwindcss, turbo, typescript, @workspace/eslint-config, @workspace/typescript-config (+28 more)

### Community 13 - "TypeScript Config Presets"
Cohesion: 0.29
Nodes (5): display, $schema, display, extends, $schema

### Community 14 - "Column Pinning & Resizing Styles"
Cohesion: 0.05
Nodes (36): 10. Risks, edge cases & mitigations, 1. Objective & non-negotiables, 2. Local project bootstrap (start fresh), 3.0 Overall layout, 3.10 Grouping, aggregation, expansion, 3.11 Ordering, pinning, resizing, DnD, row numbers, 3.12 Editing, cell/row actions, click-to-copy, 3.13 Async loading, virtualization, sticky surfaces (+28 more)

### Community 16 - "CommandDialog"
Cohesion: 0.05
Nodes (63): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+55 more)

### Community 25 - "Checkbox"
Cohesion: 0.06
Nodes (33): dependencies, cmdk, date-fns, lucide-react, @monabbir/tablecn, next, next-themes, react (+25 more)

### Community 26 - "Command"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+15 more)

### Community 27 - "getColumnSizeVars"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 28 - "getColumnWidthStyle"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 29 - "ExportOptions"
Cohesion: 0.11
Nodes (18): cssVars, dark, light, theme, highlight, highlight-foreground, dependencies, description (+10 more)

### Community 31 - "IconComponent"
Cohesion: 0.13
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+7 more)

### Community 32 - "CellEvent"
Cohesion: 0.18
Nodes (11): cssVars, files, item, NPM_DEPENDENCIES, OUT, read(), registry, REGISTRY_DEPENDENCIES (+3 more)

### Community 33 - "DataTableFilterOption"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, tailwindcss, @tailwindcss/postcss, @turbo/gen, @types/node, @types/papaparse, @types/react (+4 more)

### Community 34 - "DataTableSlotProps"
Cohesion: 0.18
Nodes (9): Adding shadcn/ui components, Architecture, Commands, Consumption model: source, not built artifacts, Critical: Next.js version, graphify, Path aliases (apps/web), Shared config packages (+1 more)

### Community 35 - "Density"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, paths, exclude, extends, include, @monabbir/tablecn/*

### Community 36 - "EditDisplayMode"
Cohesion: 0.22
Nodes (8): compilerOptions, paths, plugins, exclude, extends, include, @/*, @monabbir/tablecn/*

### Community 37 - "EditingCell"
Cohesion: 0.25
Nodes (7): Adding shadcn/ui primitives, Commands, Feature flags (the common ones), Installation, Monorepo layout, Quick start, tablecn

### Community 38 - "EditVariant"
Cohesion: 0.29
Nodes (6): Feature flags (all opt-in unless noted), Notes, Server-side / manual mode, Stability requirements, tablecn, Theming

### Community 39 - "RowEvent"
Cohesion: 0.29
Nodes (7): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins

### Community 41 - "OrgNode"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 42 - "User"
Cohesion: 0.29
Nodes (5): name, private, type, version, config

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, display, extends, $schema

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (6): exports, ./components/*, ./globals.css, ./hooks/*, ./lib/*, ./postcss.config

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, exclude, extends, include

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (4): homepage, items, name, $schema

### Community 50 - "Community 50"
Cohesion: 0.50
Nodes (4): scripts, format, lint, typecheck

## Knowledge Gaps
- **358 isolated node(s):** `geist`, `raleway`, `notoSerif`, `geistMono`, `CATEGORY_ORDER` (+353 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `CommandDialog` to `Core Render & Injected Columns`, `Community 2`, `shadcn Primitives & Styling`, `Cell Rendering & Highlighting`, `App Shell & Theming`, `Toolbar Controls`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `Button()` connect `shadcn Primitives & Styling` to `Core Render & Injected Columns`, `Community 2`, `Demo App & Monorepo Wiring`, `Toolbar Controls`, `CommandDialog`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `useDataTable()` connect `Demo App & Monorepo Wiring` to `Core Render & Injected Columns`, `Community 2`, `shadcn Primitives & Styling`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `geist`, `raleway`, `notoSerif` to the rest of the system?**
  _361 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feature Set & Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.0748663101604278 - nodes in this community are weakly interconnected._
- **Should `Core Render & Injected Columns` be split into smaller, more focused modules?**
  _Cohesion score 0.06826506826506827 - nodes in this community are weakly interconnected._
- **Should `Demo App & Monorepo Wiring` be split into smaller, more focused modules?**
  _Cohesion score 0.06453028972783142 - nodes in this community are weakly interconnected._