# Fixture Import UI - Phased Delivery Plan

> **Purpose**
> This page defines a phased approach for delivering the Fixture Import web application in incremental, stakeholder-demoable slices.

> **Planning principle**
> Each phase must deliver a **user feature** that can be shown to stakeholders and project managers, not only a backend or internal technical milestone.

---

## 1. Delivery Strategy

The web app will be delivered in progressive phases to:

- reduce implementation risk
- provide early feedback loops
- make scope and sequencing transparent
- enable regular stakeholder showcases

Each phase includes:

- a clear user-facing outcome
- explicit in-scope and out-of-scope boundaries
- demo checklist
- acceptance criteria
- phase-specific unit, functional, and integration test coverage

---

## 2. Current Baseline (Phase 0 - Complete)

Before Phase 1 begins, the repository already provides a demoable, mock-backed UI prototype:

- complete four-page UI shell (Dashboard, Import Fixtures, Published Fixtures, Activity Log)
- search, multi-select sport/group filters, range date pickers and 12-row pagination
- single and bulk import confirmation flows plus group, fixture and activity detail modals
- light/dark theming, clipboard utilities and a client-side login/sign-out journey
- a **provider abstraction** (`web/js/providers/`) that isolates the UI from any data source, with a `real-provider.js` placeholder ready for live integration
- automated checks: `npm run check:js`, `npm run test:smoke`, `npm run test:dom`

Implication for planning: each phase below is primarily an **integration and hardening** effort behind the existing provider contract, not a fresh UI build. Where a phase lists UI scaffolding, that work is largely satisfied by the current baseline and should be re-estimated accordingly.

---

## 3. Phase Overview

| Phase | User Feature Delivered | Stakeholder Value |
| --- | --- | --- |
| Phase 1 | Browse fixtures from Fixture Manager/SDH in the Import Fixtures screen | Stakeholders can validate data visibility and search/filter experience early |
| Phase 2 | Execute single fixture import to RightsLogic | Stakeholders can validate first end-to-end create-title flow |
| Phase 3 | Execute bulk fixture import and track processing statuses | Stakeholders can validate operational efficiency for larger workloads |
| Phase 4 | View published fixtures and fixture-group details | Stakeholders can validate post-import visibility and monitoring context |
| Phase 5 | Track activity and audit trail (manual + system events) | Stakeholders can validate transparency, traceability, and reporting readiness |
| Phase 6 | Process queue-driven fixture updates and reflect sync status | Stakeholders can validate automated lifecycle maintenance after import |
| Phase 7 | Production hardening (auth, error handling, observability, rollout) | Stakeholders can approve go-live readiness and operating model |

---

## 4. Tabular Phase Plan (Detailed)

| Phase | User Feature | In Scope (Summary) | Out of Scope (Summary) | Test Coverage in Phase | Showcase Outcome | Exit Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| Phase 1 | Fixture discovery in Import Fixtures | Repo/framework setup, Import Fixtures UI, Fixture Manager/SDH read integration, list/search/filter, loading/error states | Import execution, bulk import, published view, audit persistence | Unit tests for filters/helpers, functional UI tests for listing/search, integration tests for source API retrieval and error states | Stakeholders can browse real fixtures and validate discovery UX | Fixture list loads from source and filters behave correctly |
| Phase 2 | Single fixture import to RightsLogic | Single import action, confirmation flow, create-title API integration, mapping persistence, status feedback | Bulk import, queue-driven sync | Unit tests for payload mapping/status handling, functional tests for single-import UX, integration tests for RightsLogic single-create path and failure handling | Stakeholders see first end-to-end title creation journey | Single import succeeds/fails with clear user feedback and captured title reference |
| Phase 3 | Bulk import and processing visibility | Multi-select import, batch submission, partial-failure handling, progress/status visibility | Auto-sync updates | Unit tests for batch orchestration logic, functional tests for multi-select/bulk UX, integration tests for mixed-response bulk processing | Stakeholders validate operational throughput for import teams | Bulk import supports mixed outcomes without blocking successful items |
| Phase 4 | Published fixtures management view | Published fixtures screen, group summaries, expand/collapse details, title ID visibility | Deep analytics, optional future enhancements | Unit tests for grouping/aggregation logic, functional tests for drill-down and filters, integration tests for published read-model retrieval | Stakeholders can inspect imported groups and fixture detail states | Published data is consistent and drill-down works across groups |
| Phase 5 | Activity log and audit trail | Activity list, filters, detail drill-down, export path | Advanced BI-style analytics | Unit tests for activity transformation/filter logic, functional tests for log filters/details/export UX, integration tests for activity API and export endpoint | Stakeholders can trace manual/system actions with audit context | Import and system updates are logged and filterable |
| Phase 6 | Queue-driven auto synchronization | Data Hub/Fixture Hub event consumption, mapping resolution, RightsLogic update flow, sync status updates | Complex reconciliation rule engine | Unit tests for event correlation/retry logic, functional tests for sync visibility/status UX, integration tests for queue-consumer to RightsLogic update flow | Stakeholders see automatic post-import lifecycle updates | Event-driven updates complete and are visible in published/activity views |
| Phase 7 | Production-ready operational release | AuthN/AuthZ, observability, resilience, security/performance checks, rollout runbook | New major feature development | Unit tests for auth/guard helpers, functional tests for role-based access and error journeys, integration tests for production-like end-to-end critical flows | Stakeholders approve readiness for controlled production rollout | Non-functional checklist and rollout/rollback gates are signed off |

---

## 5. Detailed Phases

## Phase 1 - Fixture Discovery Foundation

### User feature
Users can open the app and use **Import Fixtures** to view fixtures from Fixture Manager/SDH with basic filtering/search.

### In scope

- repository and framework setup for the web app
- application shell with navigation baseline
- Import Fixtures page scaffold
- integration for fixture retrieval from Fixture Manager/SDH (read-only)
- fixture list rendering (table/card)
- initial filters (search, sport/group/date as feasible)
- loading/empty/error states for fixture retrieval

### Out of scope

- any import execution to RightsLogic
- bulk selection import workflows
- published fixtures page logic
- activity/audit persistence

### Acceptance criteria

- app runs in agreed non-prod environment
- fixture list is loaded from live/non-mock source (Fixture Manager/SDH)
- user can search and filter fixtures
- clear user feedback for loading, no data, and API errors
- no import button action is wired in this phase
- phase test pack is complete (unit + functional + integration for listing and retrieval behaviors)

### Stakeholder demo script

1. Open app and navigate to Import Fixtures.
2. Load fixtures from Fixture Manager/SDH.
3. Show search/filter narrowing the fixture set.
4. Show behavior when zero results are returned.
5. Show user-facing error handling for API failure simulation.

---

## Phase 2 - Single Fixture Import (First E2E)

### User feature
Users can import a **single fixture** and create a RightsLogic title.

### In scope

- single fixture import action from Import Fixtures page
- confirmation modal before import
- integration with RightsLogic create-title API (single record)
- response handling for success/failure
- source fixture to RightsLogic title mapping persistence
- status badge update in UI (for example: In Progress/Processed/Failed)

### Out of scope

- bulk import
- queue-driven updates
- advanced reporting

### Acceptance criteria

- single fixture can be selected and submitted
- RightsLogic title creation request is sent with required payload
- title ID (or processing reference) is captured and visible
- failed import surfaces actionable error state
- phase test pack is complete (unit + functional + integration for single-import behaviors)

### Stakeholder demo script

1. Select a fixture.
2. Confirm import.
3. Show successful creation response/title reference.
4. Show status change in UI.
5. Demonstrate failed call handling.

---

## Phase 3 - Bulk Import and Processing Visibility

### User feature
Users can import **multiple fixtures** in one action and track processing outcomes.

### In scope

- multi-select and bulk import confirmation
- batch submit orchestration and throttling as needed
- aggregate progress and per-fixture outcome feedback
- retry pattern for recoverable errors
- basic processing summary (queued/success/failed)

### Out of scope

- automated queue-driven update sync

### Acceptance criteria

- multiple fixtures can be queued in a single user action
- user sees per-item and aggregate status
- partial failures are visible and do not block successful items
- phase test pack is complete (unit + functional + integration for bulk-import behaviors)

### Stakeholder demo script

1. Select a set of fixtures.
2. Queue bulk import.
3. Show mixed outcomes (success + fail simulation).
4. Show what user can retry and how.

---

## Phase 4 - Published Fixtures View

### User feature
Users can view imported fixture groups and inspect imported fixture details.

### In scope

- Published Fixtures screen populated from persisted import/mapping data
- group-level summary (count, last sync, imported since)
- expand/collapse fixture group details
- view RightsLogic title IDs and current sync status

### Out of scope

- full audit analytics
- queue-triggered auto-update logic (if not already integrated)

### Acceptance criteria

- published groups are visible and filterable
- fixture-level details are drillable
- imported data is consistent with previous phase imports
- phase test pack is complete (unit + functional + integration for published-fixtures behaviors)

### Stakeholder demo script

1. Open Published Fixtures.
2. Expand a group.
3. Review imported fixtures and title identifiers.
4. Show filtering/search across groups.

---

## Phase 5 - Activity Log and Audit Trail

### User feature
Users can view a consolidated activity log of manual imports and system updates.

### In scope

- Activity Log UI with filters (group/action/date)
- activity persistence model
- details panel for change records (old vs new values where available)
- export endpoint/interface (CSV or agreed format)

### Out of scope

- deep analytics dashboarding beyond operational audit

### Acceptance criteria

- all import actions generate activity entries
- system-triggered changes are distinguishable from manual actions
- filters and detail drill-down behave as expected
- phase test pack is complete (unit + functional + integration for activity-log behaviors)

### Stakeholder demo script

1. Show latest import actions in log.
2. Filter by fixture group and action type.
3. Open a detail entry and view change context.
4. Show export path.

---

## Phase 6 - Queue-Driven Auto Sync

### User feature
Imported fixtures are automatically updated when Fixture Hub/Data Hub sends notifications.

### In scope

- queue consumer/integration flow
- correlation logic from fixture event to RightsLogic title mapping
- update execution path to RightsLogic
- activity log entries for auto-updates
- published fixture sync status updates

### Out of scope

- advanced machine-rule reconciliation workflows

### Acceptance criteria

- event receipt triggers the expected update workflow
- updates are reflected in published fixtures and activity log
- failed updates are recoverable and visible
- phase test pack is complete (unit + functional + integration for queue-sync behaviors)

### Stakeholder demo script

1. Trigger or replay a fixture change event.
2. Show automatic processing.
3. Show updated status/details in UI.
4. Show corresponding audit entry.

---

## Phase 7 - Production Readiness and Rollout

### User feature
The app is ready for controlled production use with operational safeguards.

### In scope

- authentication/authorization integration
- observability (logging, metrics, alerts)
- resilience patterns (timeouts, retries, circuit breakers where needed)
- security and performance checks
- runbooks and support handover
- phased rollout plan (pilot -> broader release)

### Out of scope

- new major feature work (handled in post-MVP roadmap)

### Acceptance criteria

- non-functional criteria signed off
- support model agreed
- rollout and rollback plans validated
- phase test pack is complete (unit + functional + integration for production critical paths)

### Stakeholder demo script

1. Show user access model.
2. Show monitoring dashboards/alerts.
3. Review readiness checklist and rollout gates.

---

## 6. Cross-Phase Governance

## 6.1 Showcase cadence

- End-of-phase showcase with product + project management
- Decision gate: proceed / revise / hold
- Capture feedback as backlog inputs for next phase

## 6.2 Definition of Done (applies to every phase)

- user feature is demoable in environment
- agreed acceptance criteria are met
- key happy-path and failure-path test evidence available
- unit tests, functional tests, and integration tests for that phase are implemented and passing
- release notes and known limitations documented

## 6.3 Testing approach (embedded, not separate phase)

- there is no standalone testing phase; testing is built into each delivery phase
- each phase must ship its own unit, functional, and integration test set for that phase scope
- the existing `check:js`, `test:smoke` and `test:dom` scripts form the regression baseline every phase must keep green
- phase exit is blocked until phase-level automated tests pass in CI/non-prod

## 6.4 Dependency management

Key dependencies to track across phases:

- Fixture Manager/SDH API readiness and test data quality
- RightsLogic API contracts and environment availability
- Data Hub/Fixture Hub notification contract and replay capability
- identity/access integration timelines

---

## 7. Suggested Milestone Structure

| Milestone | Exit Condition |
| --- | --- |
| M1 (after Phase 1) | Stakeholders approve fixture discovery UX and source data visibility |
| M2 (after Phase 2) | First single-fixture E2E import accepted |
| M3 (after Phase 3) | Bulk import accepted for operational throughput |
| M4 (after Phase 4-5) | Monitoring + audit capabilities accepted |
| M5 (after Phase 6-7) | Auto-sync and production readiness approved |

---

## 8. Initial Backlog Slice (Phase 1 Breakdown)

To align with your requested starting phase, Phase 1 backlog can be structured as:

1. Environment config and API client scaffolding inside `web/js/providers/real-provider.js`
2. Fixture Manager/SDH list endpoint integration and payload mapping to the `data` contract
3. Loading/empty/error UI states for the fixture retrieval flow
4. Verify search/filter interactions against real data volumes
5. Extend the existing smoke and DOM test packs to cover the real provider paths
6. Demo script + acceptance sign-off with stakeholders

Repo bootstrap, page layout and reusable component work are already covered by the Phase 0 baseline.

---

## 9. Notes

- This plan intentionally separates discovery/listing from import execution in Phase 1 to keep first delivery focused and achievable.
- Phases 1-6 are delivered behind the existing provider contract; the UI controller in `web/js/core/` should need little or no change.
- Scope can be rebalanced between phases depending on API readiness and stakeholder feedback.
- Any phase can be split further into Sprint A/Sprint B while preserving the same user-feature outcome.
