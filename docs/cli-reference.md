# CLI & Code Generation Reference

This guide lists all built-in CLI commands and generators available in the project, with copy-pasteable command examples.

---

## 1. Interactive Developer CLI

Launch the interactive CLI wizard with a numbered menu:

```bash
npm run cli
```

```text
========================================
  Enterprise Angular Developer CLI
========================================

? What would you like to generate?
  1) Full Feature Slice (CRUD Page + Data Access + StateService + Routes + Spec)
  2) Smart Page Component (Signals-first + ApiClient + OnPush + Spec)
  3) Presentation UI Component (input/output Signals + OnPush + Spec)
  4) Data-Access API Service (Typed CRUD methods with ApiClient + Spec)
  5) Feature State Service (Typed State + Spec)
  6) Run Architecture & Environment Doctor
  7) Import / Update API (Swagger / OpenAPI / Postman -> Endpoints & Types)
  0) Exit
```

---

## 2. Code Generators

### Generate a Complete Feature Slice

Generates an entire enterprise-ready domain folder with data-access, state service, list page, detail page, UI table, routes, and tests. Automatically registers the new route in `src/app/app.routes.ts`.

```bash
npm run generate:feature -- customer-accounts
```

```bash
npm run generate:feature -- payments
```

**Output Structure:**

```
src/app/features/customer-accounts/
├── data-access/
│   ├── customer-accounts-api.service.ts
│   └── customer-accounts-api.service.spec.ts
├── models/
│   └── customer-accounts.models.ts
├── pages/
│   ├── customer-accounts-list/
│   └── customer-accounts-detail/
├── state/
│   ├── customer-accounts-state.service.ts
│   └── customer-accounts-state.service.spec.ts
├── ui/
│   └── customer-accounts-table/
└── customer-accounts.routes.ts
```

---

### Generate a Smart Page Component

Creates a routable page component utilizing Angular Signals, OnPush change detection, and `ToastService`.

```bash
npm run generate:page -- customer-accounts/audit-logs
```

**Output:** `src/app/features/customer-accounts/pages/audit-logs-page/`

---

### Generate a Presentation UI Component

Creates a reusable presentational component using signal `input()` and `output()`.

```bash
npm run generate:component -- customer-accounts/status-badge
```

**Output:** `src/app/features/customer-accounts/ui/status-badge/`

---

### Generate a Data-Access API Service

Scaffolds a typed HTTP service configured with `ApiClient`.

```bash
npm run generate:service -- customer-accounts/billing
```

**Output:** `src/app/features/customer-accounts/data-access/billing-api.service.ts`

---

### Generate a Signal State Service

Creates an injectable signal-based state store with `computed` selectors and action methods.

```bash
npm run generate:state -- customer-accounts/billing
```

**Output:** `src/app/features/customer-accounts/state/billing-state.service.ts`

---

## 3. Smart API Importer & Schema Sync

### Import from Remote Swagger / OpenAPI URL

Analyzes the specification, generates an organized endpoint registry with path variable functions, and generates full TypeScript type contracts.

```bash
npm run api:import -- "https://api.example.com/swagger/v1/swagger.json"
# Or using local sample file:
npm run api:import -- "openapi/sample-openapi.json"
```

### Import from Local Postman Collection

Analyzes Postman collection folders, requests, `:id` path variables, query params, and synthesizes types from body/response samples.

```bash
npm run api:import -- "openapi/sample-postman-collection.json"
```

### 1-Command Re-Sync / Update Existing API

Re-fetches and updates `api-endpoints.ts` and `api-schema.ts` from the saved source configuration in `openapi/api-source.json`.

```bash
npm run api:update
```

**Generated Outputs:**

- Endpoints Registry: `src/app/core/api/api-endpoints.ts`
- TypeScript Models: `src/app/generated/api-schema.ts`
- Source Tracking: `openapi/api-source.json`

---

## 4. Quality & Architecture Verification

### Health Check Doctor

Runs all system checks in sequence (Node version, TypeScript app/spec, architecture rules, and Prettier formatting).

```bash
npm run doctor
```

### Architecture Boundary Validation

Enforces clean architectural boundaries (e.g. no feature imports in core/shared, no cross-feature internal imports, storage encapsulation).

```bash
npm run architecture:validate
```

### Strict Typecheck

Validates all TypeScript configurations without emitting output.

```bash
npm run typecheck
```

### Formatting & Linting

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format

# Run ESLint rules
npm run lint
```

### Testing

```bash
# Run unit & component tests (Vitest)
npm test

# Run Playwright E2E & Accessibility (axe WCAG) scans
npm run test:e2e
```
