# Fixture Import UI

A reusable front-end shell for the fixture import workflow, now using provider-based runtime wiring so mock modules are isolated from the default app bootstrap.

## What changed

This repo has been restructured so the reusable UI framework is separated from the mock-up layer:

- **Reusable core** lives under `web/js/core/`
- **Mock-only data and placeholder actions** live under `web/js/mock/`
- **Bootstrap wiring** lives in `web/js/app.js`
- **Provider selection** lives in `web/js/providers/`
- `web/index.html` is now a reusable shell with data containers instead of hardcoded mock rows

That means you can keep using the current mock-up now, and later replace or delete the mock layer without rewriting the UI shell.

## Architecture

```text
web/
  index.html
  css/
    styles.css
  js/
    app.js                         # bootstraps the app with the selected provider
    core/
      createFixtureImportApp.js    # reusable UI/controller layer
      helpers.js                   # reusable pure helpers
    providers/
      index.js                     # chooses app mode (mock/real)
      mock-provider.js             # adapter for web/js/mock/*
      real-provider.js             # placeholder for real API-backed implementation
    mock/
      mock-data.js                 # all mock fixture, dashboard, activity and subscription data
      mock-actions.js              # alert/confirm placeholders for mock-up mode
scripts/
  smoke-test.mjs                   # lightweight validation for core + mock wiring
package.json
```

## How it works

`web/js/app.js` now does this:

1. imports the reusable app creator from `web/js/core/createFixtureImportApp.js`
2. loads a provider via `web/js/providers/index.js`
3. receives `{ data, actions }` from the chosen provider
4. wires them into the reusable app factory

The entrypoint no longer imports mock modules directly.

## Running locally

Because the front end now uses native ES modules, use a local server instead of opening the file directly.

```bash
npm run serve
```

Then open:

```text
http://localhost:4173/web/
```

### Choose runtime mode

- Mock mode (default):

```text
http://localhost:4173/web/?mode=mock
```

- Real provider mode (placeholder adapter):

```text
http://localhost:4173/web/?mode=real
```

Mode is persisted in `localStorage` key `fixture-import-ui.app-mode`.

## Validation

Syntax check the browser modules:

```bash
npm run check:js
```

Run the lightweight smoke test:

```bash
npm run test:smoke
```

Run the DOM-level regression test that exercises the main mock-up flows:

```bash
npm run test:dom
```

## Replacing the mock layer later

When you start the real app, keep `web/js/core/` and implement the real provider.

### Remove or replace

- `web/js/providers/real-provider.js` (replace placeholder `createEmptyData` and actions)

### Add instead

- a real API-backed data source inside `web/js/providers/real-provider.js`
- real action handlers for import, refresh, subscriptions, and activity
- optional app state persistence / auth / routing if needed

Example future bootstrap shape:

```js
import { createFixtureImportApp } from './core/createFixtureImportApp.js';
import { loadRealProvider } from './providers/real-provider.js';

const provider = await loadRealProvider();
createFixtureImportApp({ data: provider.data, actions: provider.actions }).init();
```

## Recommended next phase

If this progresses into the actual app, the next sensible steps are:

1. introduce a real data adapter for Fixture Manager / RightsLogic APIs
2. move from static mock data to fetched data
3. add loading, error and empty states for real API flows
4. optionally add build tooling such as Vite once the app starts growing
5. add automated UI or integration tests
