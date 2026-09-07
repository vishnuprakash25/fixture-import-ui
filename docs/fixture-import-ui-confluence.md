# Fixture Import UI

> **Purpose**
> This page is intended as the starting point for product and technical documentation for the Fixture Import UI. It describes the *intended application* that will be built from the current UI shell, not the temporary mock data used to demonstrate the workflow.

> **Scope note**
> The current repository contains a reusable UI shell backed by mock data and placeholder actions. The production implementation is expected to keep the same user journey and module boundaries, while replacing the mock layer with real integrations to Fixture Manager, Data Hub, and RightsLogic.

> **Current implementation status**
> The UI shell is complete and exercised by automated tests. Data and behaviour are supplied through a **provider layer** (`web/js/providers/`) that resolves a runtime mode (`mock` or `real`) from a `?mode=` query parameter, the `fixture-import-ui.app-mode` local-storage key, or a `window.__FIXTURE_APP_MODE__` global, defaulting to `mock`. The `real` provider currently returns empty collections and is the single place where live integrations will be implemented. The app also ships a client-side login modal, light/dark theming, pagination and clipboard utilities; these are UX placeholders for the production equivalents rather than final security or platform decisions.

---

## 1. Overview

The **Fixture Import UI** is a browser-based operational tool for discovering sports fixtures from an upstream fixture source, selecting the fixtures that should be onboarded into **RightsLogic**, and tracking their lifecycle after import.

At a high level, the application enables users to:

- search and filter available fixtures
- import one or many fixtures into RightsLogic
- monitor which fixture groups are already published/imported
- track post-import changes received from Data Hub notification queues
- review an audit trail of manual imports and automated updates

The current UI strongly suggests a production model where:

1. **Fixture Manager** is the primary source of fixture and fixture-group data.
2. **Data Hub / Fixture Hub** provides asynchronous notifications for downstream updates.
3. **RightsLogic** is the destination system where imported fixtures are created as titles.

---

## 2. Business Objective

The application exists to reduce the operational overhead of creating and maintaining RightsLogic titles for sports fixtures.

Instead of manually creating titles and separately tracking fixture changes, users can manage the process from a single UI that:

- presents a filtered list of eligible fixtures
- preserves source fixture naming during import
- groups fixtures by competition/tournament/season
- provides visibility of imported titles
- supports automated synchronization when fixture metadata changes after import

---

## 3. Main Features

|| Feature || Description || Business Value ||
| Dashboard | Summary view of imported fixture activity, recent imports, and overall publishing state. | Gives operators an immediate view of current workload and recent outcomes. |
| Import Fixtures | Search, filter, select, and queue single or bulk fixture imports from the upstream source. | Speeds up onboarding of new fixtures into RightsLogic. |
| Published Fixtures | View imported fixture groups, imported fixture counts, latest sync time, and group-level details. | Helps teams understand what is already live and under active monitoring. |
| Activity Log | Audit view of manual imports and automatic updates, including before/after values where relevant. | Supports troubleshooting, compliance, and operational traceability. |
| Group Drill-down | Modal/detail views for fixture group composition and imported fixture detail. | Improves context before and after import. |
| Queue-driven Update Awareness | UI language and workflow indicate that imported fixtures continue to receive automatic updates from a notification queue. | Reduces the risk of RightsLogic titles diverging from upstream fixture data. |
| Clipboard / Utility Actions | Quick copy of fixture identifiers and export-style actions for operational use. | Improves day-to-day usability for support and operations teams. |
| Operator Sign-in | Login modal that gates the app and persists a lightweight session; sign-out returns the user to the locked state. | Establishes the access pattern that real identity integration will replace. |
| Filtering, Pagination and Theming | Multi-select sport/group filters, range date pickers, 12-row pagination per table, and a light/dark theme toggle. | Keeps large operational datasets usable and matches user environment preferences. |

---

## 4. Intended User Journey / Overall Workflow

### 4.1 Import workflow

1. User opens **Import Fixtures**.
2. User searches by fixture name, fixture ID, team, group, sport, or date range.
3. User reviews available fixtures returned from the source system.
4. User selects a single fixture or multiple fixtures.
5. User confirms the import action.
6. The application submits the selected fixture(s) to RightsLogic using the fixture name as the title basis.
7. Imported fixtures move into the **Published Fixtures** view and become part of the monitored set.
8. Activity entries are recorded for audit and operational visibility.

### 4.2 Post-import monitoring workflow

1. Imported fixtures are associated with a fixture group / subscription context.
2. A listener or downstream integration consumes Data Hub / Fixture Hub notifications.
3. When fixture metadata changes upstream, the relevant imported RightsLogic title is identified.
4. The system applies or queues the required update.
5. The change is surfaced in **Published Fixtures** and logged in **Activity Log**.

### 4.3 Operational review workflow

1. User opens **Dashboard** to review high-level status.
2. User opens **Published Fixtures** to inspect imported groups and latest sync times.
3. User opens **Activity Log** to review manual imports, automatic updates, and audit details.

---

## 5. Functional Areas

### 5.1 Dashboard

The dashboard acts as the landing page for operators.

Expected responsibilities:

- show high-level statistics about imported/published fixtures
- show recently imported fixtures and their processing status
- offer quick navigation into the published-fixtures view
- expose a refresh action for upstream data reload

### 5.2 Import Fixtures

This is the core operational screen for title creation.

Expected responsibilities:

- retrieve importable fixtures from the upstream source
- support text search and structured filtering
- allow single import and bulk import
- show source metadata such as group, sport, date, venue, and source fixture ID
- prevent duplicate import actions for already-imported fixtures
- confirm the exact fixtures being queued before submission

#### Implemented interaction model

The screen is deliberately **search-first**: no fixture rows are listed until the user applies a search term or a filter, and the view returns to the prompt state once all filters are cleared. This keeps the initial view cheap and, in production, avoids an unbounded fetch of the entire upstream fixture set.

Fixtures already carrying an `Imported` status are excluded from this table, which is how duplicate imports are currently prevented. Production should reinforce this server-side as well.

### 5.3 Published Fixtures

This area represents the set of fixture groups and fixtures already onboarded into RightsLogic.

Expected responsibilities:

- display imported fixture groups
- show imported fixture counts
- show latest synchronization timestamp
- surface the presence of automatic queue-driven updates
- expand a group to reveal imported fixture details and RightsLogic title IDs
- allow drill-down into activity for a specific fixture group

### 5.4 Activity Log

This is the audit and traceability layer of the application.

Expected responsibilities:

- record manual imports
- record system-driven updates triggered by notifications
- capture timestamps, actors, group context, and fixture context
- show change details such as old value and new value
- support filtering by fixture group, action type, and date range
- support export for analysis or support workflows

---

## 6. Important Modules

The codebase is already structured in a way that supports migration from a UI prototype into a real application.

|| Module || Current Role || Production Relevance ||
| `index.html` (repo root) | Redirect shim that forwards to `web/index.html`. | Convenience entry point; likely replaced by real hosting/routing configuration. |
| `web/index.html` | Reusable UI shell containing page layout, containers, tables, and modal structure. | Likely to remain as the main page shell, even when live integrations are added. |
| `web/css/styles.css` | CSS-variable based theming with light and dark modes, layout, tables, modals, filters. | Reusable presentation layer for the production app. |
| `web/js/app.js` | Bootstrap entry point that loads a provider and wires its data and actions into the core app. | Stable entry point; no change expected when swapping providers. |
| `web/js/providers/index.js` | Resolves the runtime mode (`mock`/`real`) and lazily imports the matching provider. | The switch point between prototype and production data sources. |
| `web/js/providers/mock-provider.js` | Adapter exposing `web/js/mock/*` through the provider contract. | Removable once real integrations are live. |
| `web/js/providers/real-provider.js` | Placeholder returning empty data plus a `notify` action. | The module to implement for Fixture Manager / RightsLogic integration. |
| `web/js/core/createFixtureImportApp.js` | Main controller for rendering, state, filtering, pagination, modal workflows, auth/session handling, theming, and UI events. | Core reusable presentation/controller layer for the production app. |
| `web/js/core/helpers.js` | Reusable pure helpers for filtering, date handling, formatting, escaping, and group mapping. | Stable utility layer that should remain reusable in production. |
| `web/js/mock/mock-data.js` | Temporary mock source for fixtures, groups, subscriptions, activity, and dashboard state. | Should be replaced by real data adapters and API responses. |
| `web/js/mock/mock-actions.js` | Temporary placeholder actions for refresh, import, export, and subscription-related behaviors. | Should be replaced by service calls to real APIs and queue-aware workflows. |
| `scripts/smoke-test.mjs` | Lightweight validation for utilities and data wiring (`npm run test:smoke`). | Useful baseline test coverage during migration. |
| `scripts/dom-integration-test.mjs` | JSDOM-based regression coverage for major UI flows (`npm run test:dom`). | Useful safeguard when real services are integrated. |

### Provider contract

Both providers resolve to the same shape, which is the integration seam for production work:

```js
{ mode: 'mock' | 'real', data: { ... }, actions: { ... } }
```

- `data` supplies `dashboardStats`, `fixtureGroups`, `importableFixtures`, `recentlyImported`, `subscriptions`, `activityLog` and `sportTypes`.
- `actions` supplies optional handlers: `notify`, `refreshData`, `login`, `signOut`, `confirmSingleImport`, `confirmBulkImport`, `addSubscription`, `showActivity`, `editSubscription`, `unsubscribe`, `exportLog`, `viewActivityDetails`.

All handlers are optional; the core layer invokes them defensively, so a real provider can be delivered incrementally, phase by phase.

### Recommended production module evolution

The provider seam already exists, so the practical next step is to implement `web/js/providers/real-provider.js` and, as it grows, split it into:

- dedicated API clients for Fixture Manager, Data Hub-backed read models, and RightsLogic
- a data-mapping module translating API payloads into the `data` contract above
- an actions module implementing import, refresh, subscription and export operations

This matches the architecture described in `README.md`.

---

## 7. Core Domain Concepts

|| Concept || Meaning in the app ||
| Fixture | An individual sporting event that may be imported into RightsLogic as a title. |
| Fixture Group | A logical collection of fixtures, usually representing a competition, season, tournament, or race weekend. |
| Sport Type | The category used for filtering and grouping operational views. |
| RightsLogic Title | The destination record created from an imported fixture. |
| Published Fixture | A fixture that has already been imported into RightsLogic and is now under monitoring. |
| Subscription | The monitoring relationship between an imported fixture group and the update/notification flow. |
| Activity Entry | A timestamped record of a manual import or an automated update. |

---

## 8. Data Sources

## 8.1 Primary source: Fixture Manager GET APIs

The UI copy and workflow indicate that **Fixture Manager** is the system from which importable fixtures are retrieved.

Expected GET-style data needs include:

|| Data Need || Purpose in UI || Notes ||
| Sport types | Populate sport filters. | Already represented in the current UI data model. |
| Fixture groups / competitions / tournaments | Populate group filters and group detail views. | Must include names and grouping metadata. |
| Importable fixtures | Populate the main import table. | Should include source ID, name, group ID, sport type, date, venue, and import status if available. |
| Recently changed or refreshed fixture data | Support dashboard refresh and data freshness. | Can be fetched on demand or periodically. |

### Recommended source payload shape

The production source payload should support, at minimum:

- `fixtureId`
- `fixtureName`
- `fixtureGroupId`
- `fixtureGroupName`
- `sportTypeId`
- `sportTypeLabel`
- `scheduledDateTime`
- `venue`
- `status`
- any source-system revision/version markers useful for synchronization

### Important note

The repository does **not** define concrete production endpoint URLs yet. This documentation therefore describes the expected integration contract rather than fixed API paths.

## 8.2 Secondary source: Data Hub notification queues

The UI also indicates an event-driven update model after import. In particular, published fixtures are shown as being maintained by a **Fixture Hub event queue listener**.

Expected queue / notification responsibilities:

- notify downstream systems that an imported fixture has changed upstream
- trigger title updates when fixture metadata changes
- provide sufficient correlation data to identify the affected RightsLogic title
- feed operational audit information into the activity log

Typical event examples may include:

- fixture name updates
- date/time reschedules
- venue changes
- cancellations or status changes
- competition / grouping metadata changes where relevant

### Data Hub integration expectation

The production solution will likely require:

- a consumer/listener outside the browser UI
- a service layer that translates notifications into application updates
- persistence or API exposure so the UI can show sync state and audit history

The browser UI should be treated as the **operational view**, not the direct queue consumer.

---

## 9. Data Destinations

## 9.1 Primary destination: RightsLogic POST APIs

The main destination of this application is **RightsLogic**, where selected fixtures are created as titles.

Expected POST-style responsibilities:

|| Destination Action || Purpose ||
| Create title from fixture | Create a new RightsLogic title based on the selected fixture. |
| Submit bulk fixture imports | Support efficient multi-fixture onboarding. |
| Return created title identifiers | Allow the UI to display RightsLogic title IDs in published/imported views. |
| Return processing/queue acknowledgement | Allow the UI to represent in-progress vs processed states. |

### Expected title-creation behavior

Based on the current UI:

- the fixture name is the starting point for the RightsLogic title name
- imports may be queued rather than completed synchronously
- the application should track whether a title is **in progress**, **processed**, or otherwise failed

### Minimum response data needed back from RightsLogic

- request acknowledgement / job ID
- created title ID (immediately or after processing)
- processing state
- correlation identifiers back to the source fixture/group

## 9.2 Possible secondary destination responsibilities

Although the requested focus is title creation, a production implementation may also need follow-up destination operations such as:

- update a previously created title when an upstream fixture changes
- record mapping between source fixture IDs and RightsLogic title IDs
- persist audit metadata for operational traceability

If these responsibilities are handled by a middleware service rather than directly by the UI, that service should be documented as part of the end-to-end architecture.

---

## 10. End-to-End Integration Flow

### 10.1 Create flow

1. User requests fixtures in the UI.
2. UI reads fixture and group data from Fixture Manager-backed APIs.
3. User selects fixture(s) to import.
4. UI submits import request to RightsLogic POST API (or to a middleware service that orchestrates RightsLogic creation).
5. RightsLogic returns acknowledgement and, when available, title identifiers.
6. UI surfaces imported fixtures in Published Fixtures and Dashboard.
7. Activity Log records the import event.

### 10.2 Update flow

1. Fixture data changes upstream.
2. Data Hub / Fixture Hub emits a notification.
3. Listener/service resolves the impacted source fixture and mapped RightsLogic title.
4. The title update is applied or queued.
5. Updated state is made available to the UI.
6. Activity Log records the automated update.

---

## 11. Non-Functional Expectations

The current UI structure implies the following non-functional expectations for the real application:

- **Operational clarity**: users should quickly distinguish available, imported, in-progress, and updated states.
- **Auditability**: all manual and automated actions should be traceable.
- **Idempotency**: re-import of already-imported fixtures should be prevented or safely handled.
- **Scalability**: pagination and filtering should continue to work with larger real datasets.
- **Separation of concerns**: UI shell should remain independent from mock or real service implementations.
- **Extensibility**: additional sports, competitions, and metadata fields should be accommodated without major UI redesign.

---

## 12. Known Implementation Starting Point

The current repository already provides a strong front-end baseline for the production app:

- reusable page structure and CSS-variable theming (light/dark)
- provider abstraction that isolates the UI from any data source
- client-side filtering and pagination patterns
- confirmation workflows for single and bulk import
- published-fixtures grouping and drill-down patterns
- audit-style activity presentation
- a client-side login/sign-out journey ready to be swapped for real identity integration
- regression tests for key UI behaviors (`npm run check:js`, `npm run test:smoke`, `npm run test:dom`)

This means the next delivery phase can focus primarily on:

1. implementing `real-provider.js` against live read models
2. replacing placeholder actions with API integrations
3. introducing loading/error states for real network flows
4. defining source-to-destination mapping contracts
5. formalizing queue-driven synchronization architecture
6. replacing the client-side session with the agreed identity provider

---

## 13. Open Integration Questions

The following items should be confirmed during technical design:

- What are the exact Fixture Manager GET endpoints and response contracts?
- Will the browser call RightsLogic directly, or through a backend/middleware service?
- Where will source fixture ID to RightsLogic title ID mappings be stored?
- Which service consumes Data Hub notifications and exposes the resulting sync state to the UI?
- Which updates should be applied automatically vs flagged for manual review?
- What authentication and authorization model will be used for operators?

---

## 14. Suggested Confluence Child Pages

To grow this documentation set, the following child pages would be useful:

- **Architecture Overview**
- **Fixture Manager API Contract**
- **RightsLogic API Contract**
- **Data Hub Notification Processing**
- **Operational Runbook**
- **Error Handling and Retry Model**
- **UI Screen Reference**

---

## 15. Source References

This document is grounded in the current implementation structure, especially:

- `README.md`
- `web/index.html`
- `web/js/app.js`
- `web/js/providers/index.js`
- `web/js/providers/mock-provider.js`
- `web/js/providers/real-provider.js`
- `web/js/core/createFixtureImportApp.js`
- `web/js/core/helpers.js`
- `web/js/mock/mock-actions.js`
- `scripts/smoke-test.mjs`
- `scripts/dom-integration-test.mjs`
- `package.json`

It intentionally avoids documenting the mock records themselves as product truth.

