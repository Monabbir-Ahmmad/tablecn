# Material React Table parity — roadmap

This tracks the effort to bring tablecn's data-table API toward [Material React Table](https://www.material-react-table.com) (MRT) feature/API parity.

**Philosophy.** tablecn is shadcn/Tailwind, so it deliberately does **not** mirror MRT's ~40 `muiXProps` styling props — those are replaced by `data-slot` attributes you target with Tailwind selectors. The effort focuses on genuine behavioral/structural parity. Every phase is **non-breaking** (new options default to current behavior) and ships with its doc page + a regenerated API reference (`node apps/web/scripts/build-api-docs.mjs`).

Effort key: **S** small · **M** medium · **L** large · **XL** very large.

---

## Completed (Phases 1–9)

| Phase | Area | Key additions |
| --- | --- | --- |
| 1 | Styling hooks | `data-slot` on every structural slot (table, surface, progress, toolbar, toolbar-actions, alert-banner, pagination) — replaces MRT's `muiXProps` |
| 2 | Controllable UI state | per-field controlled/observed state via `useControllableState`: `density`/`onDensityChange`, `isFullscreen`/`onIsFullscreenChange`, `showColumnFilters`/`onShowColumnFiltersChange`, `globalFilterMode`/`onGlobalFilterModeChange` |
| 3 | Toolbar render slots | `renderTopToolbar`, `renderBottomToolbar`, `renderToolbarInternalActions`, `renderBottomToolbarCustomActions`, `enableToolbarInternalActions` |
| 4 | Pagination placement | `positionPagination` (`top`/`bottom`/`both`/`none`) |
| 5 | Docs | `toolbar` + `state` guides; API reference generation |
| 6 | Column-def render depth | `meta.renderEditCell`, `renderGroupedCell`, `renderAggregatedCell`, `renderPlaceholderCell`, `columnFilterModeOptions` |
| 7 | Positioning & select-all | `positionGlobalFilter`, `positionActionsColumn`, `positionExpandColumn`, `selectAllMode`, `enableSelectAll` |
| 8 | Menu render slots & caption | `renderRowActionMenuItems`, `renderColumnActionsMenuItems`, `renderCaption` |
| 9 | Loading & faceting | `isSaving`, `showProgressBars`, `showSkeletons`, `showLoadingOverlay`, `enableFacetedValues` |

API reference as of Phase 9: **79 options · 85 instance fields**.

TanStack-native state (sorting, filters, pagination, selection, visibility, ordering, pinning, sizing, expansion, grouping) and their `onXChange`/`initialState`/`state` pass straight through `useReactTable`, so they were never part of this effort.

---

## Planned (Phases 10–17)

Recommended sequence: **10 → 11 → 12 → 13 → 14**, then optionally 15–16; **skip 17 by default**.

### Phase 10 — Filter-mode menu render slots `[S]`
`renderColumnFilterModeMenuItems` / `renderGlobalFilterModeMenuItems`. Adapt rather than copy MRT: the slot **replaces** the radio group, receiving `{ modes, currentMode, onSelect, column?, table }` and calling the provided `onSelect`.
- Touch: `data-table-filter-mode-menu.tsx`, `data-table-global-filter.tsx`, `types.ts`, `use-data-table.ts`.
- Value: medium-low · Risk: low. *(Deferred in Phase 8 — radio-group menus make a literal "render items" API awkward.)*

### Phase 11 — Alert-banner & drop-zone position `[S]`
`positionToolbarAlertBanner` (`top`/`bottom`/`none`, default `top`); `positionToolbarDropZone` (`top`/`bottom`/`both`/`none`, default `top`; grouping only).
- Touch: `data-table.tsx` (render placement of `DataTableAlertBanner` / `DataTableDropToGroupZone`), `types.ts`, `use-data-table.ts`, toolbar guide.
- Value: low-medium · Risk: low. *Completes the `position*` family.*

### Phase 12 — Virtualizer options & instance refs `[M]`
`rowVirtualizerOptions` / `columnVirtualizerOptions` (partial passthrough merged into `useVirtualizer`); `rowVirtualizerInstanceRef` / `columnVirtualizerInstanceRef`.
- Touch: `data-table.tsx` `useVirtualizer` calls, `types.ts`, virtualization guide.
- Value: medium · Risk: low-medium.

### Phase 13 — `table.refs.*` `[M]`
Expose a `refs` object on `table.cnTable` (`tableContainerRef`, `topToolbarRef`, `bottomToolbarRef`, `searchInputRef`, …).
- Touch: `use-data-table.ts` (create refs), attach in `data-table.tsx` / toolbar / pagination / global-filter, `types.ts`.
- Value: low-medium · Risk: low.

### Phase 14 — Display modes `[M–L]`
`paginationDisplayMode` (`default`/`pages` — numbered buttons; highest value, can ship alone first); `columnFilterDisplayMode` (`subheader`/`popover`); `createDisplayMode` (`modal`/`row`/`custom` — decouple create UI from `editDisplayMode`).
- Touch: `data-table-pagination.tsx`, column-filter rendering, `data-table-edit-modal.tsx`, `types.ts`.
- Value: medium · Risk: medium.

### Phase 15 — `rowPinningDisplayMode` `[L]`
Variants: `top` / `bottom` / `top-and-bottom` / `sticky` / `select-top` / `select-bottom` / `select-sticky` — where pinned rows render and whether pinning is tied to selection.
- Touch: row-pin button in `display-columns.tsx`, pinned-row rendering (`topRows`/`bottomRows`) in `data-table.tsx`, selection integration, `types.ts`, row-pinning guide.
- Value: medium · Risk: medium.

### Phase 16 — `enableGlobalFilterRankedResults` `[M]`
Rank rows by fuzzy match score and sort by rank while global search is active.
- Touch: `filter-fns.ts`, global-filter sorting integration, `types.ts`, global-search guide.
- Value: low-medium · Risk: medium (interacts with user sorting).

### Phase 17 — `layoutMode: "grid" | "grid-no-grow"` + column `grow` `[XL]`
Switch from semantic `<table>` layout to CSS grid/flex with fixed column widths; add per-column `grow`.
- Touch (big): `data-table.tsx`, `column-styles.ts`, `table.tsx`, `types.ts`, new guide.
- Value: medium · Risk: high. **Recommend last, or skip** unless a concrete need arises.

---

## Conventions

- New `useDataTable` options need a `/** … */` JSDoc in `packages/ui/src/components/data-table/types.ts` so the API-docs generator (`apps/web/scripts/build-api-docs.mjs`) picks them up.
- Per `CLAUDE.md`: run `graphify query` before broad reading/grepping, and `graphify update .` after edits.
- A full MRT source copy may be available locally for naming/behavior reference; verify before relying on it.
