# Fixture Import UI

A reusable front-end shell for the fixture import workflow, currently bootstrapped with mock data and mock actions.

## What changed

This repo has been restructured so the reusable UI framework is separated from the mock-up layer:

- **Reusable core** lives under `web/js/core/`
- **Mock-only data and placeholder actions** live under `web/js/mock/`
- **Bootstrap wiring** lives in `web/js/app.js`
- `web/index.html` is now a reusable shell with data containers instead of hardcoded mock rows

That means you can keep using the current mock-up now, and later replace or delete the mock layer without rewriting the UI shell.

## Architecture

```text
web/
  index.html
  css/
    styles.css
  js/
    app.js                         # bootstraps the app with a data/actions implementation
    core/
      createFixtureImportApp.js    # reusable UI/controller layer
      helpers.js                   # reusable pure helpers
    mock/
      mock-data.js                 # all mock fixture, dashboard, activity and subscription data
      mock-actions.js              # alert/confirm placeholders for mock-up mode
scripts/
  smoke-test.mjs                   # lightweight validation for core + mock wiring
package.json
```

## How it works

`web/js/app.js` currently does this:

1. imports the reusable app creator from `web/js/core/createFixtureImportApp.js`
2. imports `mockData` from `web/js/mock/mock-data.js`
3. imports `mockActions` from `web/js/mock/mock-actions.js`
4. wires them together at runtime

So later, instead of editing the core UI, you can swap only the injected implementation.

## Running locally

Because the front end now uses native ES modules, use a local server instead of opening the file directly.

```bash
npm run serve
```

Then open:

```text
http://localhost:4173/web/
```

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

When you start the real app, keep `web/js/core/` and replace the mock modules.

### Remove or replace

- `web/js/mock/mock-data.js`
- `web/js/mock/mock-actions.js`
- the imports inside `web/js/app.js`

### Add instead

- a real API-backed data source
- real action handlers for import, refresh, subscriptions, and activity
- optional app state persistence / auth / routing if needed

Example future bootstrap shape:

```js
import { createFixtureImportApp } from './core/createFixtureImportApp.js';
import { realData } from './real/data-source.js';
import { realActions } from './real/actions.js';

createFixtureImportApp({ data: realData, actions: realActions }).init();
```

## Recommended next phase

If this progresses into the actual app, the next sensible steps are:

1. introduce a real data adapter for Fixture Manager / RightsLogic APIs
2. move from static mock data to fetched data
3. add loading, error and empty states for real API flows
4. optionally add build tooling such as Vite once the app starts growing
5. add automated UI or integration tests
