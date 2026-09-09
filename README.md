# Frontend Starter

The approved starting point for new Angular applications in this organisation.

It gives teams a consistent application structure, secure browser defaults, quality checks, and a small set of shared utilities. Use this project to begin product work; use `frontend-reference-app` to see the patterns in action.

## What is included

- Feature-first, lazy-loaded routes and signals-first UI state.
- Secure runtime configuration, cookie or bearer-token HTTP transport, and encrypted non-auth preferences.
- Reusable form, unsaved-change, page-state, permission, feature-flag, error, and connectivity utilities.
- Unit, browser, accessibility, architecture, lint, format, and build checks.

## Run it

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

`public/app-config.json` is public runtime configuration. Set the API base URL, trusted origins, and `authTransport` (`cookie` by default, or `bearer`) for each environment; never add credentials or secrets to it.

## Build a feature

```bash
npm run generate:feature -- customer-accounts
```

The generator creates a feature shell with routes, state, data access, UI, and tests. Keep business code in `features/`; use `core/` for application-wide infrastructure and `shared/` for reusable, business-agnostic UI.

Use `ApiClient` for internal APIs. Keep HTTP calls in data-access services, not components. Use typed reactive forms for business forms, and add `unsavedChangesGuard` to routes that edit data.

## Before a pull request

```bash
npm run format:check
npm run lint
npm run typecheck
npm run architecture:validate
npm test
npm run test:e2e
npm run build
```

Run `npm run test:e2e` after installing the Playwright browser once:

```bash
npx playwright install chromium
```

## Learn the conventions

Read the [engineering guide](docs/engineering-guide.md) before implementing a feature. The approved packages and usage rules are in the [stack and libraries guide](docs/stack-and-libraries.md).
