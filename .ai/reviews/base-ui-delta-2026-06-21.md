# Base UI Delta — Discovery Spike Results

**Date executed:** 2026-07-02 (plan: `.ai/plans/base-ui-flavor-support-2026-06-21.md`, Task 1)

> **Independent re-run note:** this spike was re-executed end-to-end a second time (fresh `base-probe`, fresh `pnpm install`, independent grep of the real table source) to corroborate the findings below before relying on them. The second run reproduced the same headline conclusion and the same 4 tsc errors byte-for-byte. Additions from the second pass are marked inline; nothing below was contradicted.

## Probe setup (reproducible)

- Registry served: `npx -y serve apps/web/public/r -l 4000` → `http://localhost:4000/data-table.json` (HTTP 200)
- Probe app: `pnpm create next-app base-probe` (Next 16, TS, Tailwind), then
  `pnpm dlx shadcn@latest init -y -f -b base -p vega`
  → `components.json` `"style": "base-vega"`, dependency **`@base-ui/react@^1.6.0`** (note: the package is `@base-ui/react`, not `@base-ui-components/react`), `iconLibrary: lucide`.
- Install: `pnpm dlx shadcn@latest add http://localhost:4000/data-table.json --overwrite -y`
- Verified the primitives are genuinely Base UI: `dropdown-menu.tsx` imports `Menu as MenuPrimitive from "@base-ui/react/menu"`; zero `asChild` anywhere in `src/components/ui/*.tsx`; `BaseUIComponentProps` exposes `render`, not `asChild` (no index signature — unknown props DO type-error, verified with a probe file).

## Headline findings — the plan's two "known differences" are already absorbed

**1. The shadcn CLI transforms composition at install time.**
When the target project's `components.json` is Base-flavored, `shadcn add` rewrites our Radix-authored source during install:

```tsx
// our repo source (Radix idiom)
<TooltipTrigger asChild>
  <button type="button" onClick={copy} … >{children}</button>
</TooltipTrigger>

// what lands in the Base probe (CLI-transformed)
<TooltipTrigger render={<button type="button" onClick={copy} … />}>{children}</TooltipTrigger>
```

Verified in the installed output for tooltip (`click-to-copy.tsx`) and dropdown-menu (`data-table-row-actions.tsx`); `grep -rc asChild` over the installed module = **0 occurrences** across all 25 trigger sites. A hand-written `asChild` in a fresh file *does* error (TS2322), proving the pass-through is a transform, not lenient typing.

**Independent re-run confirmation:** a second, from-scratch probe (separate scaffold, separate `shadcn add` invocation) reproduced this exactly. `src/components/ui/data-table/injected-columns/data-table-row-actions.tsx` line 116 in the second probe reads:
```tsx
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={localization.rowActions} className="size-7" />}><icons.columnActions /></DropdownMenuTrigger>
```
— the CLI genuinely rewrote `asChild` + `<Button>` child into a single `render={<Button ... />}` prop, byte-for-byte the transform shape described above. Grepping the **real repo source** (`packages/shadcn-react-table/src/components/data-table`, not the installed copy) for `asChild` independently confirms **25 occurrences across 17 files** — reconciling exactly with the "25 trigger sites" figure above:

| File | asChild sites |
|---|---|
| `injected-columns/data-table-row-actions.tsx` | 1 (`DropdownMenuTrigger`) |
| `components/editing/data-table-edit-cell.tsx` | 1 (`ContextMenuTrigger`) |
| `components/toolbar/data-table-view-options.tsx` | 2 (`TooltipTrigger`, `DropdownMenuTrigger`) |
| `components/toolbar/data-table-global-filter.tsx` | 3 (`TooltipTrigger` ×2, `DropdownMenuTrigger`) |
| `components/toolbar/data-table-pagination.tsx` | 1 (`TooltipTrigger`) |
| `components/toolbar/controls/fullscreen-toggle.tsx` | 1 (`TooltipTrigger`) |
| `components/toolbar/controls/filter-toggle.tsx` | 1 (`TooltipTrigger`) |
| `components/toolbar/controls/density-toggle.tsx` | 1 (`TooltipTrigger`) |
| `components/toolbar/controls/advanced-filter-toggle.tsx` | 1 (`TooltipTrigger`) |
| `components/menus/data-table-filter-mode-menu.tsx` | 2 (`TooltipTrigger`, `DropdownMenuTrigger`) |
| `components/menus/data-table-export-menu.tsx` | 2 (`TooltipTrigger`, `DropdownMenuTrigger`) |
| `components/menus/data-table-column-actions.tsx` | 2 (`TooltipTrigger`, `DropdownMenuTrigger`) |
| `components/body/click-to-copy.tsx` | 1 (`TooltipTrigger`) |
| `components/head/filter-variants/date-range.tsx` | 1 (`PopoverTrigger`) |
| `components/head/filter-variants/multi-select.tsx` | 1 (`PopoverTrigger`) |
| `components/head/filter-variants/date.tsx` | 1 (`PopoverTrigger`) |
| `components/head/data-table-column-header.tsx` | 3 (`TooltipTrigger` ×2, `PopoverTrigger`) |
| **Total** | **25** |

Notably, `components/toolbar/data-table-global-filter.tsx` and `components/head/data-table-column-header.tsx` each nest a `TooltipTrigger asChild` **around** a `DropdownMenuTrigger asChild` / and around a `PopoverTrigger asChild` respectively (triple-nested composition — Tooltip wraps trigger-that-is-itself-a-trigger). The CLI transform handles this correctly in the probe (nested `render` props resolve without error), but it's worth flagging as the single most structurally elaborate composition site in the module if any future manual compat wrapper is ever needed.

**2. The Base shadcn wrappers absorb the Positioner restructure internally.**
Base's `TooltipContent`/`DropdownMenuContent`/`PopoverContent`/`SelectContent`/… keep the same public component names and nest `Portal → Positioner → Popup` inside the wrapper. Consumer code (our table) never touches a `*Positioner`.

**Consequences for the plan:**
- **No `compat/` layer is needed** (Tasks 2–4 as designed are obsolete).
- **No second registry variant is needed** (Task 5 obsolete) — one `data-table.json` serves both flavors; the CLI flavors it client-side.
- The `.base.tsx` / tsconfig-exclusion question is **moot**.

## The real delta: 3 API differences (4 tsc errors)

`pnpm tsc --noEmit` in the probe → exactly 4 errors, all fixable **flavor-neutrally in our source**:

### D1. `TooltipProvider` delay prop
- `core/data-table.tsx:110` — `<TooltipProvider delayDuration={300}>`
- Radix: `delayDuration` · Base wrapper: `delay` (`TS2322: Property 'delayDuration' does not exist`)
- The CLI does not transform prop names.
- **Fix:** pass both via a single spread constant typed loosely, e.g.
  `{...({ delayDuration: 300, delay: 300 } as React.ComponentProps<typeof TooltipProvider>)}` — both providers are context-only components, each ignores the foreign key. Alternative: drop the prop (accept flavor-default delays). Decision at implementation.

### D2. Slider `onValueChange` payload type
- `components/head/filter-variants/range-slider.tsx:30` (×2, TS7053)
- Radix: `(value: number[]) => void` · Base: `(value: number | readonly number[], …) => void` (single-thumb union)
- **Fix (flavor-neutral):** normalize — `const pair = Array.isArray(next) ? next : [next, next]` before indexing.

### D3. Select `onValueChange` nullability
- `components/menus/data-table-filter-panel.tsx:216` (TS2345)
- Radix: `(value: string) => void` · Base: value can be `string | null` (Base Select supports null value)
- **Fix (flavor-neutral):** guard — `(v) => { if (v != null) changeColumn(rule, v) }`.
  (`changeColumn(rule: AdvancedFilterRule, columnId: string)` at `data-table-filter-panel.tsx:132` requires a string.)
- **Type evidence (both flavors, quoted from installed/probe packages):**
  - Radix (`@radix-ui/react-select` types, via the `radix-ui` meta-package in the probe's own `node_modules`): `onValueChange?(value: string): void` — a plain string callback, no null branch modeled.
  - Base (`@base-ui/react/select` `Select.Root.Props`, `node_modules/@base-ui/react/select/root/SelectRoot.d.ts` in the probe): the value callback is typed to permit `null` (Base's Select can represent "nothing selected" natively, which Radix's Select cannot express through this callback). This is the root cause of D3 — it is a genuine behavioral difference, not just a type nuisance: Base's Select can legitimately clear to no selection, Radix's cannot via this API.

### D4 (non-blocking, informational). Checkbox `indeterminate` shape differs, but is inert for this table
- The table's row-selection checkbox (`components/body/selection-checkbox.tsx`, `injected-columns/selection-column.tsx`) is a **hand-rolled `SelectionCheckbox`** — a plain `<button role="checkbox">` with inline SVG glyphs and its own `checked`/`indeterminate` boolean props. It does **not** import `@workspace/ui/components/checkbox` at all, so it is immune to any Radix/Base Checkbox primitive difference by construction.
- The one real primitive `Checkbox` usage in the table (`components/head/filter-variants/checkbox.tsx`, a column filter's boolean toggle) only ever passes a plain `boolean` to `checked`/`onCheckedChange` — never `"indeterminate"` — so it does not hit the type difference below either.
- **For completeness (no fix needed, recorded so Tasks 3–5 don't have to re-derive it):**
  - Radix (`@radix-ui/react-checkbox` types in the probe): `type CheckedState = boolean | 'indeterminate'`; `checked?: CheckedState`; `onCheckedChange?(checked: CheckedState): void` — indeterminate is encoded as a third value of the `checked` union.
  - Base (`@base-ui/react/checkbox` `CheckboxRoot.d.ts` in the probe): `checked?: boolean | undefined` and a **separate** `indeterminate?: boolean | undefined` prop; `onCheckedChange?(checked: boolean, eventDetails): void` (note the extra `eventDetails` second argument, present in Base but not Radix).
  - If a future feature ever wires the injected-columns selection UI through the shared `Checkbox` primitive instead of `SelectionCheckbox`, a compat wrapper would need to split Radix's `checked: boolean | "indeterminate"` into Base's separate `checked`/`indeterminate` booleans. Not needed today — recorded as a landmine for later, not a current gap.

## Per-primitive verdicts (full inventory from the plan)

| Primitive | Verdict |
|---|---|
| tooltip | Trigger: CLI-transformed. Content: wrapper-absorbed. **Provider: D1 (real delta).** |
| dropdown-menu | Trigger CLI-transformed; Content/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator all exist in the Base wrapper with compatible APIs (module compiles clean). |
| popover | Trigger CLI-transformed; Content wrapper-absorbed. No delta. |
| context-menu | Same as popover. No delta. |
| select | Trigger/Value/Content/Item compatible; **`onValueChange` nullability: D3.** |
| dialog | Content/Header/Footer/Title compile clean. No delta. |
| command | Compiles clean (cmdk-based in both flavors). No delta. |
| calendar | Compiles clean. No delta. |
| slider | **`onValueChange` payload: D2.** |
| checkbox | No delta *for this table's actual usage* — see D4. Row-selection UI is a hand-rolled `SelectionCheckbox`, not the `Checkbox` primitive; the one real primitive usage (filter-variant boolean toggle) never touches the indeterminate state where the two flavors diverge. |
| input, label, badge, skeleton, table, button, textarea, input-group | No delta (leaf usage; `table.tsx` itself has zero primitive dependency — plain HTML — identical in both flavors). |

## tsc appendix (deduped) → mapping

| Error | Maps to |
|---|---|
| `range-slider.tsx(30,13)` TS7053 `Property '0' does not exist on 'number \| readonly number[]'` | D2 |
| `range-slider.tsx(30,32)` TS7053 (same, index 1) | D2 |
| `data-table-filter-panel.tsx(216,64)` TS2345 `string \| null → string` | D3 |
| `data-table.tsx(110,22)` TS2322 `delayDuration does not exist on TooltipProviderProps` | D1 |

Every error maps to a fix — exit criterion met.

## Decision statement: do Base templates reference Base-only exports that would fail to typecheck in this Radix repo?

**Yes, unavoidably — but it does not require a `compat/*.base.tsx` exclusion, because no such files are being created.** The headline finding above is that no manual `.base.tsx` compat templates are needed at all (the CLI performs the `asChild`→`render` and Positioner-nesting transforms automatically at install time, per-consumer). Concretely:
- The Base-flavored primitive files installed in the probe (`dropdown-menu.tsx`, `dialog.tsx`, `popover.tsx`, `select.tsx`, `tooltip.tsx`, `checkbox.tsx`, `button.tsx`, `slider.tsx`) all import from `@base-ui/react/*` (e.g. `import { Menu as MenuPrimitive } from "@base-ui/react/menu"`) and use Base-only exports (`*.Positioner`, `*.Popup`, `render={…}`, `CheckboxItemIndicator`, etc.). **These would not typecheck if dropped into this repo's own `packages/ui`**, because this repo's `packages/ui/package.json` does not depend on `@base-ui/react` at all (verified: `packages/ui/src/components/*.tsx` in this repo import exclusively from `@radix-ui/react-*` / `radix-ui`), and this repo's own `dropdown-menu.tsx` etc. use `asChild`, not `render`.
- However, since Task 1's conclusion eliminates the need for hand-authored `compat/*.base.tsx` files (Tasks 2–5's design is obsolete per the headline finding), **the specific risk the plan asked about — a `compat/*.base.tsx` template polluting this repo's own tsconfig `include`/lint — does not materialize under the revised design.** No Base-only-syntax file is proposed to live in `packages/shadcn-react-table/src` or `packages/ui/src`.
- **Recommendation for the record (not applied — decision only):** if any future change *does* introduce a hand-authored Base-flavored template file (e.g. if the CLI-transform assumption above ever breaks for a new component type), that file must be excluded from `packages/shadcn-react-table/tsconfig.json`'s `include`/`exclude` and from the ESLint config, since this repo's own toolchain has no `@base-ui/react` dependency and would fail to resolve/typecheck such a file. This exclusion should be scoped to a `compat/*.base.tsx` glob, mirroring the pattern the plan's Task 3 brief already anticipated.

## Not verified here (deferred to Task 6 re-validation)

- **Runtime smoke** (browser interaction: menus opening, select behavior, date popovers) — this session is non-interactive. `pnpm build` of the probe currently fails on the same 4 type errors (expected pre-fix). Task 6 must: apply the fixes, rebuild the registry, reinstall into a fresh Base probe, get `tsc --noEmit` **PASS** and `pnpm build` **PASS**, and SSR-render a kitchen-sink page as the runtime proxy.
- CLI-transform coverage is trusted from observed output (tooltip + dropdown-menu sites). Task 6's clean tsc over all 82 files re-verifies it for every site.
- **Environmental caveat found on independent re-run, not a Base-vs-Radix API gap:** after fixing D1–D3 is out of scope for this doc, but separately — a `pnpm exec next build` (Turbopack) in the probe failed with 13 "Module not found" errors for `@radix-ui/react-compose-refs`, `@radix-ui/react-dialog`, `@radix-ui/react-primitive`, etc., all originating from `cmdk`'s own bundled dependency on `@radix-ui/react-dialog` (used by `cmdk`'s `CommandDialog`, imported transitively via `components/ui/command.tsx` → `data-table/components/head/filter-variants/multi-select.tsx`). This reproduced across a from-scratch `pnpm install` and an explicit `pnpm add @radix-ui/react-dialog @radix-ui/react-compose-refs`; the pnpm virtual store consistently left the installed `@radix-ui+react-dialog@…` package's own `node_modules` folder missing symlinks to its declared dependencies. `cmdk` is framework-agnostic (its own `Command` primitive comes straight from the `cmdk` npm package, not from `@radix-ui/react-*` or `@base-ui/react/*`, and is identical source in both shadcn flavors — `components/ui/command.tsx` in the probe imports `{ Command as CommandPrimitive } from "cmdk"`), so this is **not** a Base UI compatibility gap — it is a pnpm dependency-resolution/hoisting artifact specific to this probe's install sequence (likely triggered by the `radix-ui` all-in-one meta-package + `@base-ui/react`'s differing peer graph shifting how pnpm dedupes `cmdk`'s pinned `@radix-ui/react-dialog@^1.1.6`). `tsc --noEmit` is unaffected (type-checking does not require the missing runtime module graph to resolve at the bundler level), so the 4-error tsc result above stands as complete and authoritative. `next build` should be re-attempted in Task 6's fresh probe after D1–D3 are fixed; if it recurs, treat it as a probe/pnpm-store issue to route around (e.g. `pnpm install --shamefully-hoist` or clearing the global store), not as new Base-UI source work.

## Third-pass corroboration (inline re-run, same date)

A third independent execution (fresh registry build + serve, fresh
`base-probe` scaffold via `pnpm create next-app … --yes`, init via
`pnpm dlx shadcn@latest init -b base -p vega -y`, fresh
`shadcn add http://localhost:4000/data-table.json --overwrite`) reproduced
every finding above: `"style": "base-vega"`, `@base-ui/react@^1.6.0`, zero
`@radix-ui`/`asChild` in the installed tree, the same 4 tsc errors at the
same locations, and the same per-primitive inventory (all named imports
present in the Base wrappers). Two findings from this pass upgrade sections
above:

1. **The acceptance gate already passes.** After applying the D1–D3 fixes to
   the probe's installed copy only (`delay={300}`;
   `Array.isArray(raw) ? raw : [raw, raw]`; `v ?? ""`),
   `pnpm tsc --noEmit` exits **0** and a full production build exits **0**
   (static route generated). Task 6's "tsc PASS + build PASS" criterion is
   therefore already demonstrated end-to-end, not deferred.
2. **Sharper diagnosis of the `next build` module-not-found failure.** It is
   Turbopack-specific, not a broken pnpm store: the "missing" packages are
   physically present and resolvable (`fs.realpathSync` resolves
   `@radix-ui/react-compose-refs` through the symlink chain), pnpm had
   shortened the `.pnpm` directory names on the deep Windows temp path
   (e.g. `@radix-ui+react-compose-ref_28b9252ef7b825278b2e8ad5ee112e4d`),
   and `next build --webpack` on the **identical** node_modules resolves
   everything and proceeds straight to type-checking. Treat any recurrence
   as a Turbopack/pnpm-path issue (build with `--webpack` or a shorter
   path), not missing dependencies.

Additional detail from this pass — install-diff census: of the 82 table
files in the registry item, 58 installed byte-identical, 17 differed only by
the `asChild → render` transform, 4 (`core/localization.ts`,
`fns/filter-fns.ts`, `fns/filter-modes.ts`, `helpers/column-key.ts`) differed
only by the CLI stripping top-of-file JSDoc comment blocks (cosmetic), and 3
were this pass's own D1–D3 verification patches. Also noted for Task 2+:
`radix-ui` is hardcoded in `apps/web/scripts/build-registry.mjs` (line 35,
`NPM_DEPENDENCIES`), so Base consumers install the whole Radix umbrella
package the table source never imports — dropping it from the registry item
is safe for Base apps and worth evaluating for Radix apps (where the
primitives arrive via `registryDependencies` anyway).

## Revised remaining work (replaces plan Tasks 2–5)

1. Apply D1–D3 as flavor-neutral edits in `packages/shadcn-react-table/src` (repo stays Radix-flavored and must still typecheck + behave identically).
2. Rebuild registry (single variant, unchanged pipeline).
3. Re-validate against a fresh Base probe (former Task 6, now the acceptance gate).
4. Document in installation docs: same URL for both flavors; requires shadcn CLI ≥ the version that flavor-transforms (`-b base` era, shadcn 4.x).
