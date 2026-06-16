# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**tablecn** (`@monabbir/tablecn`) is a shadcn/ui data table with **Material React Table (MRT V3) parity**, built on TanStack Table v8 and distributed as a **shadcn registry block** (consumers run `npx shadcn add` and the source is copied into their project). Workspaces:

- **`packages/tablecn`** (`@monabbir/tablecn`) — the product: the data-table module only. Depends on `@workspace/ui` for the shadcn primitives it renders.
- **`packages/ui`** (`@workspace/ui`) — the shared shadcn primitives (button, dialog, table, …), `lib/utils` (`cn`), and the single `globals.css`. This is the shadcn target — `pnpm dlx shadcn add` writes here. Consumed by both `@monabbir/tablecn` and `apps/web`.
- **`packages/eslint-config`**, **`packages/typescript-config`** — shared config presets.
- **`apps/web`** — the docs site, live examples, and the registry host that serves `/r/data-table.json`.

The data table is the product; everything in `apps/web` exists to document and ship it. The primitives in `@workspace/ui` are in-repo dependencies — they are *not* shipped to consumers (the registry declares them as `registryDependencies` so consumers get them from upstream shadcn in their own style).

## Critical: Next.js version

This repo uses **Next.js 16.2.6** (with React 19.2.4). Per `AGENTS.md`, this version has breaking changes vs. older Next.js — APIs, conventions, and file structure may differ from training data. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Commands

Package manager is **pnpm 10.33.4** (Node ≥ 20). All top-level tasks are orchestrated by Turborepo and fan out via `dependsOn: ["^task"]`.

From repo root:
- `pnpm dev` — runs `next dev` for `apps/web` (persistent, uncached)
- `pnpm build` — builds all workspaces
- `pnpm lint` — ESLint across workspaces
- `pnpm typecheck` — `tsc --noEmit` across workspaces
- `pnpm format` — Prettier `--write` across workspaces

Per-package: the same scripts exist in each workspace's `package.json` and can be run directly, e.g. `pnpm --filter tablecn-web <script>`, `pnpm --filter @monabbir/tablecn <script>`, or `pnpm --filter @workspace/ui <script>`.

There is no test runner configured in this repo.

## Plans, reviews, and commits

- **Plans** live in `.ai/plans/<plan-name>-<date>.md` (repo root).
- **Code reviews** live in `.ai/reviews/<review-name>-<date>.md` (repo root).
- **Commits:**
  - Never commit unless explicitly asked.
  - Commits are authored as the repo user — never add a `Co-Authored-By` trailer.
  - Subject line only — no commit body/description.
  - Message format: `<prefix>: <msg>` (e.g. `feat: add column pinning`, `fix: debounce filter input`).

> Plans are stored under `.ai/plans/` and code reviews under `.ai/reviews/`.

## Adding shadcn/ui components

Run from the **repo root** (not inside `apps/web`):

```bash
pnpm dlx shadcn@latest add <component> -c apps/web
```

Components land in `packages/ui/src/components/` (the `@workspace/ui` package, not `apps/web`). The `apps/web/components.json` `ui` alias is wired to `@workspace/ui/components`, so the shadcn CLI writes there even when targeting the web app. Import with `import { Foo } from "@workspace/ui/components/foo"`.

shadcn config (both `components.json` files agree): `style: radix-sera`, `baseColor: neutral`, `iconLibrary: remixicon`, RSC + TSX enabled, CSS variables on. The single source-of-truth stylesheet is `packages/ui/src/styles/globals.css`.

## Architecture

Turborepo + pnpm workspaces. Workspaces are `apps/*` and `packages/*`.

### Consumption model: source, not built artifacts

Neither `@monabbir/tablecn` nor `@workspace/ui` has a **build step**. Their `exports` fields point directly at `./src/*` (`.ts`/`.tsx`), and `apps/web/next.config.ts` declares `transpilePackages: ["@monabbir/tablecn", "@workspace/ui"]` so Next compiles both packages' source in-tree. Consequences:
- Edits in `packages/tablecn/src/` and `packages/ui/src/` are picked up immediately by `next dev` — no rebuild needed.
- The packages cannot be consumed outside a bundler that transpiles them (intentional — they're private internal packages).
- `apps/web/tsconfig.json` maps `@monabbir/tablecn/*` → `../../packages/tablecn/src/*` and `@workspace/ui/*` → `../../packages/ui/src/*` so TS resolves the same source paths as runtime.

### The data-table module

The product lives at `packages/tablecn/src/components/data-table/`, organized by **layer**:

- `index.ts` — the public API barrel; the single entry consumers import (`@monabbir/tablecn/components/data-table`). Treat it as the API surface — keep it curated.
- `core/` — the engine and shared definitions: `data-table.tsx`, `use-data-table.ts`, `types.ts`, `constants.ts`, `config-context.tsx`, `icons.tsx`, `localization.ts`.
- `components/` — the supporting UI grouped by region (`head/ body/ toolbar/ editing/ menus/`); regions nest their own subfolders (`head/filter-variants/`, `body/dnd/`, `toolbar/controls/`).
- `hooks/` — auxiliary hooks: `use-grid-navigation.ts`, the state-slice hooks composed by `use-data-table` (`use-controllable-state`, `use-editing-state`, `use-column-filter-modes`, `use-global-filter-mode`, `use-resolved-columns`, `use-page-reset-on-filter-change`), and the render hooks (`use-table-dnd`, `use-table-virtualizers`).
- `display-columns/` — column-def factories for the injected columns (`selection`, `expand`, `row-drag`, `row-number`, `row-actions`) + `RowDragContext`.
- `helpers/` — pure, framework-light helpers (`column-key`, `column-label`, `effective-filter-mode`, `is-column-editable`).
- `fns/` — the filter engine (`filter-modes`, `filter-factories`, `ranked-row-model`, `variant-modes`) behind the `filter-fns` barrel · `utils/` — style + export helpers (`column-styles.ts`, `export-utils.ts`).

The data-table imports the **shadcn primitives** it renders (button, dialog, table, …) from `@workspace/ui/components/*` and `cn` from `@workspace/ui/lib/utils` — those primitives live in `packages/ui/src/components/` and are a separate package.

### Registry & generated artifacts

`apps/web` ships the table as a registry block and generates **committed** artifacts from the package source. Never hand-edit these — change the source and regenerate:

- `build-registry.mjs` → `apps/web/public/r/{data-table,registry}.json` — recursively walks the module, rewrites package imports to portable `@/` aliases, and preserves the folder structure consumers receive.
- `build-api-docs.mjs` → `apps/web/lib/api-reference.generated.ts` — API tables derived from `types.ts` / `use-data-table.ts` / `icons.tsx` / `localization.ts` under `packages/tablecn/src/components/data-table` (paths are hardcoded in the script; update them if those files move).
- `build-example-source.mjs` → `apps/web/lib/example-source.generated.ts`.
- `build-search-index.mjs` → docs search index.

Run individually via `pnpm --filter tablecn-web {registry,api,examples,search}:build`, or all of them plus `next build` via `pnpm --filter tablecn-web build`. Preview the production static export with `pnpm --filter tablecn-web preview` (serves `apps/web/out` at `http://localhost:3000`).

### Path aliases (apps/web)
- `@/*` → app-local files (`apps/web/*`) — used for app-only components/hooks/lib
- `@monabbir/tablecn/components/data-table` → the product (`packages/tablecn/src/...`)
- `@workspace/ui/components/*`, `@workspace/ui/hooks/*`, `@workspace/ui/lib/*` → shared primitives package (`packages/ui/src/...`)
- `@workspace/ui/globals.css` — the shared stylesheet, imported once in `apps/web/app/layout.tsx`
- `cn` helper lives at `@workspace/ui/lib/utils` (clsx + tailwind-merge)

### Shared config packages
- `@workspace/eslint-config` exports `./base`, `./next-js`, `./react-internal`. `apps/web` uses `next-js`; `packages/ui` and `packages/tablecn` use `react-internal`. Root `.eslintrc.js` only sets ignore patterns.
- `@workspace/typescript-config` exports `base.json`, `nextjs.json`, `react-library.json`. Each workspace's `tsconfig.json` extends the right one.

### Styling
Tailwind CSS v4 via `@tailwindcss/postcss`. Prettier is configured with `prettier-plugin-tailwindcss`, scanning `packages/ui/src/styles/globals.css` and recognizing the `cn` and `cva` functions for class sorting. Prettier style: no semicolons, double quotes, 2-space, `trailingComma: es5`, `printWidth: 80`, LF line endings.

Theme switching is handled by `next-themes` via `apps/web/components/theme-provider.tsx`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
