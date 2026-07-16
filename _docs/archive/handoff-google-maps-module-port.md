# Handoff — Port the original Google Maps scraper into Papertrail's module system

_Last updated: 2026-06-17_

## TL;DR for next session

**Goal:** Take the existing, working scraper at `/Users/dustin/projects/google-map-scrapper` and run it **verbatim (full app)** as the **Google Maps module** inside Papertrail's extension. The module system is just the **shell** — it provides project context and routes by **URL/domain** to the active module. Each module owns its own full UI + behaviour + data.

**Decision (from the user):**
- _"If we were able to just use what we have there [the original scraper] but make it work with our module system — that's where we need to go."_
- **Full app, verbatim** port (keyword groups, results table + rows, details modal, enrichment, export, data manager, progress, confirm modal, resize).
- The module keeps **its own data shape** (the original's `results`/keyword storage). The observation/graph layer is **not** required for this module right now — see [Decision 4](#decision-4--observationgraph-layer).

**Mental model:**
```
Module system = shell (project context + URL routing + side-panel frame)
Google Maps module = the original scraper app, dropped in, activated on google.com/maps
Side panel renders the ACTIVE MODULE'S OWN component (not a generic list)
```

This supersedes the Phase-1 approach where the side panel showed one generic observations list. That generic list should be **replaced** by per-module UIs.

---

## Why this changes the current architecture

Phase 1 built a generic side panel that renders one observations list for all modules. The new vision is **module-owns-its-UI**: the side panel must render whichever Vue component the active module supplies. So the module contract grows a **panel component**, and the side panel becomes a thin frame around it.

### Required change to the module contract

`extension/src/modules/types.ts` — add a side-panel component to `CollectorModule`:

```ts
import type { Component } from 'vue'

export interface CollectorModule {
    descriptor: ModuleDescriptor
    matches(url: string): boolean
    /** Vue component rendered in the side panel when this module is active. */
    panelComponent: Component
    createRuntime?(emit: EmitObservations): ModuleRuntime  // may be dropped — see Decision 4
}
```

### Required change to the side panel

`extension/src/side-panel/App.vue` becomes a shell:
- Header: `📎 Papertrail` + active project name/goal + module chip (keep what exists).
- Body: `<component :is="activeModuleComponent" />` resolved from the registry by the active tab URL (reuse `useActiveModule` + `registry.resolveModule`). Wrap in `<KeepAlive>` so module state survives tab switches.
- Remove the generic observations list / `useObservations` / collect controls from the shell — those now live inside the Google Maps module's own component (ported from the original `popup/App.vue`).

---

## Source inventory → target mapping

Original lives at `/Users/dustin/projects/google-map-scrapper/src`. Target is `extension/src/modules/google-maps/`.

| Original file | Target in Papertrail |
|---|---|
| `popup/App.vue` (313 lines, main UI) | `modules/google-maps/Panel.vue` (the module's side-panel root) |
| `popup/components/*.vue` (12 files) | `modules/google-maps/components/*.vue` |
| `popup/composables/useChromeStorage.js` | `modules/google-maps/composables/useChromeStorage.js` **— see Decision 3 (proxy-clone fix)** |
| `popup/composables/useContentMessaging.js` | `modules/google-maps/composables/useContentMessaging.js` |
| `popup/composables/useKeywordGroups.js` | `modules/google-maps/composables/useKeywordGroups.js` |
| `popup/utils/download.js`, `fuzzySearch.js` | `modules/google-maps/utils/` |
| `popup/style.css` | `modules/google-maps/style.css` (scope it so it doesn't leak into the shell) |
| `content/content.js` (714 lines) | `modules/google-maps/content.js` |

Components to port (all 12): `AppHeader`, `ConfirmModal`, `DataManager`, `DetailsModal`, `ExportDropdown`, `KeywordList`, `KeywordListItem`, `ProgressBar`, `ResizeHandle`, `ResultsTable`, `ResultsTableRow`, `ScrapeControls`.

### What in the current Papertrail extension to keep / replace / remove

**Keep (shell):**
- `background/service-worker.ts`, `content/content-script.ts` (router entry — will delegate to the module's content logic).
- `modules/registry.ts`, `modules/types.ts` (extend with `panelComponent`).
- `composables/useActiveModule.ts`, `composables/useProject.ts`, `composables/useChromeStorage.ts` (hardened — has the proxy/echo fix).
- `popup/*` (project switcher), `stores/keys.ts`, `utils/*`.

**Replace:**
- `side-panel/App.vue` → thin shell rendering the active module component.
- `modules/googleMaps.ts` → re-point to the ported module (descriptor + matcher + `panelComponent` + content delegation).

**Remove or shelve (Phase-1 generic approach, now superseded):**
- `side-panel` generic observations list, `composables/useObservations.ts`, `composables/useContentMessaging.ts` (the shell's version — the module brings its own), `observations/*`, `extractors/googleMaps.ts` + its test, `observation.test.ts`.
- `contracts/*` — **keep the files** (cheap, useful later for the graph), just don't wire them into the GMaps module. See Decision 4.

> Note: the current `extractors/googleMaps.ts` + `modules/googleMaps.ts` runtime were a _partial reimplementation_ of the scraper. The verbatim port replaces them with the original `content.js`, which is more complete (enrichment, dedupe by Place ID, human-like pacing, single-result enrich, scroll-to-listing).

---

## Integration decisions

### Decision 1 — JS vs TS
Port **verbatim as JS** (`.js` + `<script setup>` `.vue` without `lang="ts"`) to minimise risk and diff. Enable JS in the extension build:
- `extension/tsconfig.json`: add `"allowJs": true` and relax `noUnusedLocals/Parameters` for ported files, or exclude `modules/google-maps/**` from `vue-tsc` strictness initially.
- Vite/CRXJS already compiles `.js`/`.vue` fine. TS-ify later if desired.

### Decision 2 — Content script wiring
The manifest already injects one content entry (`content/content-script.ts`) on `https://www.google.com/maps/*`. Two clean options:
- **(A, recommended)** `content-script.ts` resolves the module by URL and dynamically imports + runs `modules/google-maps/content.js`. Keeps one entry, scales to more modules.
- **(B)** Add the original `content.js` as its own `content_scripts` entry in `manifest.config.ts`. Simpler verbatim, but per-module manifest entries.

Either way, **keep the original content↔panel message protocol** (`ACTIVATE`, `BULK_SCRAPE`, `STOP_SCRAPE`, `PROGRESS`, `KEYWORD_ACTIVE`, `ENRICH_SINGLE`, `SCROLL_TO_LISTING`, `SCRAPE_DONE`, etc.). Do **not** force it onto the shell's `PtMessage` union — the module owns its messaging.

### Decision 3 — chrome.storage proxy-clone fix (important)
The original `useChromeStorage.js` writes Vue reactive arrays straight to `chrome.storage.local.set`. In our setup this **silently corrupts data** (a reactive Proxy serializes as `{0: …}` instead of an array, or throws "could not be cloned"). Apply the same fix we used in the shell's hardened version when porting:
- Write a plain snapshot: `chrome.storage.local.set({ [key]: JSON.parse(JSON.stringify(value)) })`.
- Suppress echo writes via a `lastSynced = JSON.stringify(...)` comparison.
See `extension/src/composables/useChromeStorage.ts` for the reference implementation.

### Decision 4 — Observation/graph layer
For this module: **do not require it.** The module reads/writes its own `results` store, exactly like the original. Keep `contracts/*` in the tree for the future graph work, but the GMaps module won't emit observations in this pass. (Revisit a unified data model once 2+ modules exist and the UX feels right.)

### Decision 5 — Project scoping of module data
The original stores everything under a single `results` key. Papertrail has projects. Decide one:
- **(A, recommended)** Namespace the module's storage by active project, e.g. `gmaps.results.<projectId>`, `gmaps.keywords.<projectId>`. Switching projects scopes the table/keywords. The shell exposes the active project id (`useProject` / `getActiveProjectId`).
- **(B)** Keep global storage for v1, add scoping later. Faster port, but projects won't isolate data yet.

The module's `Panel.vue` should read the active project from the shell (provide/inject or import `useProject`) and show project name/goal in its header to match the wireframes (Frames 3–4).

### Decision 6 — popup vs side panel
- **Popup** stays the project switcher (`popup/App.vue`, already built).
- **Side panel** hosts the active module. When on Google Maps, that's the ported scraper UI. The original mounted its App in both popup and side-panel; here it lives **only** in the side panel via the module shell.

---

## Step-by-step plan

1. **Extend the module contract** — add `panelComponent: Component` to `CollectorModule` (`modules/types.ts`); decide whether to drop `createRuntime` (Decision 4).
2. **Copy the original files** into `modules/google-maps/` per the mapping table. Fix relative imports.
3. **Apply the proxy-clone fix** to the module's `useChromeStorage` (Decision 3).
4. **Project scoping** — namespace storage keys by active project (Decision 5A) and surface project name/goal in the panel header.
5. **Wire the registry** — `modules/googleMaps.ts` exports `{ descriptor, matches, panelComponent: Panel }`.
6. **Rebuild the side-panel shell** — render `<component :is>` from the active module; remove the generic observations UI.
7. **Wire content** — delegate `content-script.ts` → `modules/google-maps/content.js` (Decision 2A), preserving the original message protocol.
8. **Manifest** — confirm `content_scripts` match `https://www.google.com/maps/*`; keep popup + side_panel entries.
9. **Build config** — `allowJs` + relax strict TS for ported JS (Decision 1).
10. **Verify** — `npm --prefix ./extension run build`, load `extension/dist`, open a Maps search, confirm: keyword list, Capture Visible Results, Scroll & Collect, results table, details modal, export, data manager all work, and data is scoped to the active project.

---

## Current Papertrail extension structure (as of this handoff)

Self-contained extension in `extension/` (`src/` source, `dist/` build output, own `package.json`/`vite.config.ts`/`manifest.config.ts`). CRXJS + Vue 3 + TS. Build: `npm --prefix ./extension run build`. Type-check: `... run types`. Tests: `... run test` (Vitest, 13 passing). Dev/HMR: `... run dev`.

Gotcha already solved: background and content entry files **must have distinct basenames** (`service-worker.ts`, `content-script.ts`) — two `index.ts` entries made CRXJS cross-wire the service-worker loader to the content chunk (`window is not defined`).

Reminder: plain `npm run build` at the repo root builds the **Laravel** app. The extension builds only via `npm --prefix ./extension ...` (or from inside `extension/`).

---

## Original app reference (what we're porting)

- Stack: Vite + `@crxjs/vite-plugin` 2.6.1 + Vue 3, MV3, plain `manifest.json`, JS (no TS).
- `content/content.js`: `CONFIG.SELECTORS` map; passive `MutationObserver` capture (debounced); `bulkScrape` = phase 1 scroll-collect + phase 2 click-each with randomized human-like delays; dedupe by Place ID; `mergeEntry` enrichment; `enrichSingleResult`; `scrollListingIntoView`. Stores to `chrome.storage.local.results`.
- `popup/App.vue`: keyword groups (left), results table (right), resizable divider, scraping banner + progress, export, data manager, confirm modal. Reused by side-panel via `side-panel/main.js`.
- Composables: `useContentMessaging` (typed `{type,...}` senders + listener), `useChromeStorage` (reactive `results`/`popupSize`/`panelWidth`), `useKeywordGroups` (group results by keyword).

---

## Open questions for next session

1. **Project scoping** — confirm Decision 5A (namespace by project) vs 5B (global for now).
2. **Content wiring** — confirm Decision 2A (single delegating entry) vs 2B (per-module manifest entry).
3. **Strip vs shelve** the Phase-1 observation layer (`observations/`, `extractors/`, generic side-panel list). Recommended: remove the generic list now; leave `contracts/` for later.
4. **Multiple keyword projects vs the original's single keyword grouping** — does the per-project model replace keyword groups, sit alongside them, or nest (project → keywords → results)?
5. Eventual TS migration of the ported JS — now or later?
