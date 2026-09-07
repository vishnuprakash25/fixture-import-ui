# Fixture Import UI - Architecture Overview

> **Document purpose**
> This page provides a high-level architectural overview of the Fixture Import UI. It is intended for solution architects, product stakeholders, and delivery teams who need to understand the role of the application, its system boundaries, and its key integrations.

> **Scope**
> This overview is based on the intended production application that will be built from the current UI shell. It does not treat the temporary mock data as part of the target solution design.

---

## 1. Overview

The **Fixture Import UI** is an operational application used to bring sports fixtures from an upstream source into **RightsLogic** and to monitor those fixtures after import.

Its primary role is to sit between:

- the upstream fixture domain, where fixture data is sourced and maintained
- the downstream RightsLogic domain, where fixtures are created as titles
- the event/notification layer, where post-import changes are communicated and synchronized

In simple terms, the application helps users:

- find fixtures that are available for import
- create RightsLogic titles from those fixtures
- view what has already been imported
- track changes after import through an audit and monitoring layer

---

## 2. Architectural Intent

The application is designed as a **user-facing orchestration layer** for fixture onboarding and monitoring.

It is not intended to be the system of record for fixture data itself. Instead, it provides:

- a guided UI for selecting and importing fixtures
- visibility into the status of imported fixture groups
- operational traceability for manual and automated changes
- a monitoring surface for downstream synchronization activity

The architecture suggests a clear separation between:

- **presentation**: the browser UI
- **source integration**: retrieval of fixture and group data
- **destination integration**: creation and maintenance of RightsLogic titles
- **event-driven synchronization**: handling updates received from Data Hub / Fixture Hub

---

## 3. Business Role of the Application

The Fixture Import UI addresses a common operational problem: teams need a controlled and visible way to create RightsLogic titles from fixture data, while also maintaining alignment when the source fixtures later change.

Without such an application, teams would typically face:

- manual title creation effort
- inconsistent tracking of imported fixtures
- limited visibility of which fixture groups are already onboarded
- weak traceability for updates and corrections

The application therefore provides a managed import and monitoring capability across the fixture lifecycle.

---

## 4. High-Level Capability Model

|| Capability || Description ||
| Fixture Discovery | Users can search and filter fixtures that are available for import from the upstream source. |
| Fixture Import | Users can import a single fixture or multiple fixtures into RightsLogic. |
| Published Fixture Visibility | Users can see which fixture groups and fixtures have already been imported. |
| Post-Import Monitoring | Users can monitor imported fixtures that remain subject to source-system changes. |
| Audit and Traceability | Users can review manual imports and automated updates through an activity log. |
| Operational Navigation | Users can move between overview, import, published, and activity views in a single workflow. |

---

## 5. System Context

At a high level, the application sits in the middle of three logical domains:

### Upstream source domain
This is where fixtures and fixture groups originate.

The current UI implies that this role is fulfilled by **Fixture Manager**.

### Event and synchronization domain
This domain communicates changes to already-imported fixtures.

The current workflow suggests **Data Hub / Fixture Hub** is responsible for publishing notification events when source fixtures change.

### Downstream destination domain
This is where imported fixtures are created and managed as business titles.

The current UI implies that this role is fulfilled by **RightsLogic**.

### Logical context diagram

```text
Fixture Manager
   |  (GET fixture and group data)
   v
Fixture Import UI
   |  (POST create/import requests)
   v
RightsLogic

Data Hub / Fixture Hub
   |  (notification events for fixture changes)
   v
Synchronization / update handling
   v
RightsLogic + operational visibility in Fixture Import UI
```

---

## 6. Main Functional Areas

### 6.1 Dashboard
The dashboard provides a summary of the current operational state.

It is intended to answer questions such as:

- How much fixture import activity is currently visible?
- What has been imported recently?
- Are imported fixtures progressing as expected?

### 6.2 Import Fixtures
This is the main operational entry point for onboarding fixtures.

It allows users to:

- browse candidate fixtures
- filter by sport, group, and date
- review fixture details before import
- initiate single or bulk import actions

### 6.3 Published Fixtures
This area shows what is already onboarded into RightsLogic.

It provides a grouped view of imported fixtures and supports ongoing operational monitoring.

### 6.4 Activity Log
This area acts as the audit and history layer.

It allows users to understand:

- what was imported
- when it happened
- whether a change was manual or automated
- which fixture group or title was affected

---

## 7. High-Level Workflow

### 7.1 Import workflow

1. A user enters the application and searches for fixtures.
2. The application retrieves eligible fixture data from the upstream source.
3. The user selects one or more fixtures for import.
4. The application submits those fixtures for title creation in RightsLogic.
5. The imported fixtures become part of the published/monitored set.
6. The application records the action for operational visibility.

### 7.2 Post-import synchronization workflow

1. A source fixture changes after it has already been imported.
2. A notification is emitted through the Data Hub / Fixture Hub layer.
3. A synchronization process resolves the affected imported title.
4. The relevant update is applied or queued for processing.
5. The application reflects the outcome in its monitoring and activity views.

### 7.3 Operational review workflow

1. Users review summary status on the dashboard.
2. Users inspect imported fixture groups in Published Fixtures.
3. Users drill into Activity Log for detailed history and change tracking.

---

## 8. Data Sources

### 8.1 Fixture Manager GET APIs
The primary source of business data is expected to be **Fixture Manager**.

At an architecture level, Fixture Manager is expected to provide:

- fixture groups
- fixture metadata
- sport classification data
- fixture identifiers needed for correlation and import

### 8.2 Data Hub / Fixture Hub notifications
The application also depends on a notification-driven update model.

At an architecture level, this event source is expected to provide:

- notification of upstream fixture changes
- enough context to identify the impacted imported fixture/title
- a trigger for downstream synchronization and audit recording

### Architectural note
The browser UI should be viewed as the **consumer of already-processed operational state**, rather than the component directly reading from queues. In a production architecture, queue consumption is more likely to happen in a backend or middleware layer.

---

## 9. Data Destinations

### RightsLogic POST APIs
The primary destination is **RightsLogic**, where selected fixtures are created as titles.

At a high level, the destination interaction is expected to support:

- title creation from selected fixtures
- acknowledgment of import requests
- return of title identifiers and/or processing status
- later title maintenance when source fixtures change

---

## 10. Architectural Building Blocks

From a solution perspective, the application can be understood through five logical building blocks.

### 10.1 User Interface Layer
Provides the operational screens and user interactions.

Responsibilities:

- search and selection
- confirmation workflows
- status display
- activity visibility

### 10.2 Source Data Access Layer
Retrieves fixture and grouping data from upstream systems.

Responsibilities:

- read fixture availability
- read fixture-group context
- supply filterable data to the UI

### 10.3 Import Orchestration Layer
Coordinates the creation of RightsLogic titles.

Responsibilities:

- transform selected fixtures into import requests
- call downstream creation APIs
- track request outcomes and processing states

### 10.4 Synchronization Layer
Handles changes that occur after the initial import.

Responsibilities:

- respond to upstream notifications
- correlate source fixtures to imported titles
- drive downstream updates where needed

### 10.5 Audit / Monitoring Layer
Maintains operational visibility across manual and automated actions.

Responsibilities:

- activity history
- status reporting
- operational traceability

---

## 11. Integration Pattern

The target architecture appears to follow a **hybrid synchronous + asynchronous integration model**.

### Synchronous interactions
Used when the user is actively working in the UI.

Examples:

- retrieving fixtures and fixture groups
- submitting import requests
- loading published fixture status
- retrieving activity history

### Asynchronous interactions
Used when fixture changes occur after import.

Examples:

- receiving notification events from Data Hub / Fixture Hub
- applying downstream updates to RightsLogic
- updating audit and sync status after background processing

This split is important because the application supports both:

- immediate operator-driven actions
- ongoing system-driven maintenance after import

---

## 12. Key Architectural Characteristics

The intended application should support the following characteristics:

- **Clear system boundaries** between source systems, UI, and destination systems
- **Operational transparency** so users can see both import state and change history
- **Traceability** for manual and automated actions
- **Extensibility** for additional sports, fixture groups, and metadata
- **Separation of reusable UI from data adapters**, which is already reflected in the current repository structure
- **Support for event-driven updates** after the initial import lifecycle step

---

## 12.1 Current Repository Realisation

The repository today implements the presentation layer of this architecture and stubs the integration layers.

| Architectural building block | Current state in the repository |
| --- | --- |
| User Interface Layer | Fully implemented in `web/index.html`, `web/css/styles.css` and `web/js/core/createFixtureImportApp.js` (four pages, filtering, pagination, modals, theming, clipboard, login/sign-out). |
| Source Data Access Layer | Abstracted behind `web/js/providers/`. `mock-provider.js` serves static data; `real-provider.js` is a placeholder returning empty collections. |
| Import Orchestration Layer | Represented by the `confirmSingleImport` / `confirmBulkImport` action callbacks only; no downstream call exists yet. |
| Synchronization Layer | Not implemented in the browser. Sync state is presented as data supplied by the provider, consistent with the intent that queue consumption happens in a backend service. |
| Audit / Monitoring Layer | Presented in Published Fixtures and Activity Log from provider-supplied data; no persistence exists yet. |

Key point for solution design: the **provider contract** (`{ mode, data, actions }`) is the agreed seam between the UI and the wider architecture. Real integration work is expected to be delivered behind that contract rather than inside the UI controller.

Runtime mode is selected via a `?mode=mock|real` query parameter, the `fixture-import-ui.app-mode` local-storage key, or a `window.__FIXTURE_APP_MODE__` global, defaulting to `mock`.

The current login modal and its local-storage session are a UX placeholder. It demonstrates the access journey but does not represent the target security model, which remains an open design item.

---

## 13. Assumptions and Constraints

This overview is based on the current solution direction and makes the following assumptions:

- Fixture Manager remains the primary source of fixture discovery data.
- RightsLogic remains the primary destination for title creation.
- Notification-based updates continue to be part of the target operating model.
- The real production solution will use backend or middleware services for at least part of the integration and synchronization workload.
- The current UI shell is a close approximation of the intended user journey for the live application.

---

## 14. Risks / Design Considerations

The following areas should be clarified as part of detailed solution design:

- where fixture-to-title mapping is persisted
- whether the UI calls RightsLogic directly or through a service layer
- how queue-driven updates are reconciled and surfaced to users
- what retry and failure-handling model exists for imports and updates
- what security model is used for operational users
- how the application distinguishes between in-progress, successful, failed, and corrected updates

---

## 15. Summary

The Fixture Import UI should be viewed as an **operational control point** for the fixture-to-title lifecycle.

Its architectural purpose is to:

- source fixture data from upstream systems
- orchestrate title creation in RightsLogic
- maintain visibility of imported fixtures over time
- surface automated changes received through event-driven synchronization
- provide a single operational view across import, publish, and activity history

In short, it is not just an import screen; it is the front-end layer of a broader import-and-synchronize architecture.

