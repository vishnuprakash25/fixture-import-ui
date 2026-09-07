# Fixture Import UI

A dependency-free, ES-module front end for the fixture import workflow. The reusable UI/controller core is fully decoupled from its data source through a **provider** layer, so the current mock-up can be replaced with real API integrations without rewriting the UI shell.

- No build step, no framework — plain ES modules served straight from disk
- Single dev dependency (`jsdom`), used only for DOM-level tests
- Four operational pages: Dashboard, Import Fixtures, Published Fixtures, Activity Log

## Repository layout

```text
index.html                         # redirect shim -> /web/index.html
web/
  index.html                       # reusable UI shell (layout, tables, modals, filters)
  css/
    styles.css                     # CSS-variable theming, light + dark mode
  js/
    app.js                         # bootstrap: load provider -> create app -> init
    core/
      createFixtureImportApp.js    # reusable UI/controller layer (state, render, events)
      helpers.js                   # reusable pure helpers
    providers/
      index.js                     # resolves app mode and lazily loads a provider
      mock-provider.js             # adapter for web/js/mock/*
      real-provider.js             # placeholder for the API-backed implementation
    mock/
      mock-data.js                 # mock fixtures, groups, subscriptions, activity, stats
      mock-actions.js              # alert/confirm placeholders for mock-up mode
scripts/
  smoke-test.mjs                   # helper + mock-data validation
  dom-integration-test.mjs         # JSDOM regression coverage for the main UI flows
docs/
  fixture-import-ui-confluence.md            # product/technical reference
  fixture-import-ui-architecture-overview.md # system context and integration model
  fixture-import-ui-phased-delivery-plan.md  # phased delivery approach
  fixture-import-ui-architecture.drawio
package.json
```

## How it works

`web/js/app.js` is the only entrypoint and it never imports mock modules directly:

1. waits for `DOMContentLoaded`
2. calls `loadAppProvider()` from `web/js/providers/index.js`
3. receives `{ mode, data, actions }` from the resolved provider
4. passes `{ data, actions }` into `createFixtureImportApp(...)` and calls `.init()`

```js
import { createFixtureImportApp } from './core/createFixtureImportApp.js';
import { loadAppProvider } from './providers/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const provider = await loadAppProvider();
  createFixtureImportApp({ data: provider.data, actions: provider.actions }).init();
});
```

## Running locally

The front end uses native ES modules, so it must be served over HTTP rather than opened via `file://`.

```bash
npm install   # only needed for the DOM test (jsdom)
npm run serve
```

Then open <http://localhost:4173/web/> (the root `index.html` also redirects there).

### Runtime modes

| Mode | URL | Behaviour |
| --- | --- | --- |
| `mock` (default) | `http://localhost:4173/web/?mode=mock` | Full mock dataset + alert-based placeholder actions |
| `real` | `http://localhost:4173/web/?mode=real` | Placeholder adapter returning empty collections |

Mode resolution order in `providers/index.js`:

1. `?mode=real` / `?mode=mock` query parameter (persisted when present)
2. `localStorage` key `fixture-import-ui.app-mode`
3. global `window.__FIXTURE_APP_MODE__`
4. fallback: `mock`

`npm run serve:mock` and `npm run serve:real` are aliases of `npm run serve`; the mode is chosen in the browser, not by the server.

## Provider contract

A provider is an async function returning:

```js
{ mode: 'mock' | 'real', data: { ... }, actions: { ... } }
```

### `data` (all keys expected)

| Key | Shape | Used by |
| --- | --- | --- |
| `dashboardStats` | stat cards (`value`, `label`, `icon`, `trend`, `chart`, `metrics`) | Dashboard |
| `fixtureGroups` | map of `groupId -> { id, name, sport, season, organiser, startDate, endDate, venue, fixtures, totalFixtures }` | filters, group modal |
| `importableFixtures` | `{ id, groupId, name, shortId, sportType, typeId, date, venue, status }` | Import Fixtures |
| `recentlyImported` | `{ id, name, groupId, sport, date, venue, importDate, importedBy, titleId, importStatus }` | Dashboard |
| `subscriptions` | imported-group monitoring records (counts, last sync, queue status) | Published Fixtures |
| `activityLog` | `{ id, timestamp, action, fixture, groupId, detailType, oldValue, newValue, updatedBy, actionBadge, status, source }` | Activity Log |
| `sportTypes` | `{ id, label }` | sport filters |

### `actions` (all optional)

Every handler is invoked with optional chaining, so a provider may implement only what it needs.

| Action | Called with | Trigger |
| --- | --- | --- |
| `notify` | `(message)` | generic user feedback (defaults to `alert`) |
| `refreshData` | `({ data, state })` | Dashboard refresh button |
| `login` | `({ email, displayName })` | successful login form submit |
| `signOut` | `({ displayName })` | sign out from the user menu |
| `confirmSingleImport` | `({ title, fixture, titles, data, state })` | single fixture import confirmed |
| `confirmBulkImport` | `({ titles, fixtures, data, state })` | bulk import confirmed |
| `addSubscription` | `()` | add subscription button |
| `showActivity` | `(subscription)` | activity drill-down from a subscription |
| `editSubscription` | `(subscription)` | subscription settings |
| `unsubscribe` | `(subscription)` | unsubscribe from a group |
| `exportLog` | `({ data, state })` | Activity Log export |
| `viewActivityDetails` | `(entry)` | activity row details (modal is rendered by the core) |

## Core module reference

### `createFixtureImportApp({ data, actions = {} })`

Returns `{ init }`. `init()` caches DOM nodes, restores any stored auth session, binds event handlers and performs the first render.

Behaviour owned by the core layer:

- four-page navigation (Dashboard, Import Fixtures, Published Fixtures, Activity Log)
- **search-first Import Fixtures view**: the table shows a prompt until a search term or filter is applied, and returns to that prompt when every filter is cleared
- the Import table lists only fixtures whose `status` is not `Imported`
- text search across fixture name, IDs, sport, venue, date and group name, plus multi-select sport/group filters and range date pickers on the Import, Published and Activity views
- client-side pagination at 12 rows per page for fixtures, subscriptions and activity
- Dashboard "Recently imported" shows a capped preview of the 5 most recent items
- single and bulk import confirmation modals, plus group detail, imported-fixture detail and activity detail modals
- login modal with the session persisted to `localStorage` key `fixture-import-ui.auth-user`, plus sign-out
- light/dark theme toggle (`dark` class on `<body>`)
- copy-to-clipboard for fixture IDs with a transient confirmation toast
- relative time formatting and a time-of-day dashboard greeting

### `helpers.js`

| Function | Signature | Purpose |
| --- | --- | --- |
| `toYYYYMMDD` | `(value) => string` | compact `YYYYMMDD` key for date comparisons |
| `formatDisplayDate` | `(value) => string` | `Mon D, YYYY` display formatting |
| `parseFixtureDate` | `(value) => Date \| null` | parse and normalise to midnight |
| `buildFixtureTitle` | `({ fixtureName, prefix, suffix }) => string` | compose the RightsLogic title candidate |
| `escapeHtml` | `(value) => string` | escape interpolated values before injection |
| `normalizeGroupKey` | `(name, fixtureGroups) => string` | resolve a group name to its ID |
| `getGroupOptions` | `(fixtureGroups) => Array<{ id, label }>` | sorted option list for group filters |
| `filterFixtures` | `(fixtures, filters, fixtureGroups) => Array` | apply search, sport, group and date filters |
| `cloneDate` | `(value) => Date \| null` | defensive date copy |
| `getFixtureShortId` | `(id) => string` | short display ID (prefix before first hyphen) |

## Validation

```bash
npm run check:js     # node --check on every browser module
npm run test:smoke   # helper + mock data assertions
npm run test:dom     # JSDOM regression pass over the main UI flows
```

`scripts/dom-integration-test.mjs` loads `web/index.html` in JSDOM, stubs `alert`, `confirm` and the clipboard, then asserts navigation, theme toggling, filtering, pagination, import modals, subscription expansion, activity filtering and clipboard behaviour.

## Replacing the mock layer

Keep `web/js/core/` and `web/index.html`; implement `web/js/providers/real-provider.js`:

1. replace `createEmptyData()` with real reads (Fixture Manager fixtures, groups and sport types; the imported/published read model; the activity log).
2. replace `createRealActions()` with real handlers for import, refresh, subscription and export operations.
3. add loading, empty and error states around the network flows.
4. wire real authentication in place of the local login modal session.

The mock layer (`web/js/mock/`, `web/js/providers/mock-provider.js`) can then be deleted without touching the UI shell.

## Roadmap

Near-term technical steps:

1. implement the real provider against Fixture Manager / RightsLogic APIs
2. move from static mock data to fetched data with loading and error handling
3. persist the source-fixture to RightsLogic-title mapping
4. introduce build tooling (for example Vite) once the app grows beyond plain modules
5. expand automated UI and integration coverage alongside each delivery phase

See `docs/` for the product reference, architecture overview and phased delivery plan.
