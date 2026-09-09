# Approved Stack and Library Rules

This guide defines the packages already approved for this starter. Do not add a dependency when the platform, Angular, or one of these libraries already provides the capability.

## Runtime packages

| Package           | Use it for                                                                                   | Rules                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@angular/*`      | Components, routing, HTTP, forms, signals, animations                                        | Use standalone APIs, `inject()`, lazy feature routes, signals for UI state, and typed Reactive Forms for business forms. Do not introduce NgModules or direct `HttpClient` usage in components. |
| `rxjs`            | HTTP streams and asynchronous composition                                                    | Use operators to express cancellation and concurrency. Do not nest subscriptions; keep subscriptions in state/data-access layers when possible.                                                 |
| `ng-zorro-antd`   | Complex accessible UI controls: tables, modal dialogs, selects, notifications, date controls | Prefer NgZorro for interaction-heavy widgets. Use semantic HTML and accessible labels around it; do not rebuild its widgets with custom JavaScript.                                             |
| `@lucide/angular` | Icons                                                                                        | Import only the icons a component uses. Icon-only buttons require an accessible name and the SVG must be `aria-hidden="true"`.                                                                  |
| `tailwindcss`     | Layout, spacing, responsive design, typography, and simple visual states                     | Use utility classes and the application design tokens. Do not add a second CSS framework or scatter arbitrary inline styles.                                                                    |
| `tslib`           | TypeScript runtime helpers                                                                   | Do not import it directly in product code.                                                                                                                                                      |

## Platform capabilities already in use

| Capability     | Use it for                                                  | Rules                                                                                                                                     |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Web Crypto API | AES-256-GCM encryption of non-auth persisted preferences    | Access it only through `CryptoService` and `SecureStorageService`. Never persist tokens, passwords, private keys, or plaintext fallbacks. |
| IndexedDB      | Persisting non-extractable `CryptoKey` objects              | Access it only through `KeyStoreService`. Do not create feature-owned databases for secure-storage concerns.                              |
| `localStorage` | Ciphertext written by `SecureStorageService`                | Feature code must not access it directly. Encryption reduces exposure at rest; it does not protect against XSS.                           |
| `fetch`        | Loading the public runtime `app-config.json` before startup | Runtime configuration is public. It may contain URLs and environment names, never secrets.                                                |

## Development and quality packages

| Package                                                   | Use it for                                             | Rules                                                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`                                              | Strict compilation                                     | Do not introduce `any`. Prefer inferred types where obvious and `unknown` at trust boundaries.                                            |
| `vitest` and Angular test utilities                       | Unit and component tests                               | Test observable behaviour: success, failure, loading, permissions, and security-sensitive failures. Run `npm test` before a pull request. |
| `eslint`, `@typescript-eslint/*`, and `@angular-eslint/*` | Static rules for TypeScript and templates              | Fix violations; do not add disable comments without an explicit engineering reason.                                                       |
| `prettier`                                                | Formatting                                             | Run `npm run format` only when formatting intended files, and `npm run format:check` in validation.                                       |
| `husky` and `lint-staged`                                 | Fast pre-commit checks                                 | Keep hooks fast. Full tests and builds belong in CI.                                                                                      |
| `@angular/build` and `@angular/cli`                       | Development server, test runner, and production builds | Use package scripts rather than globally installed Angular tooling.                                                                       |
| `@playwright/test` and `@axe-core/playwright`             | Critical browser journeys and automated accessibility  | Cover login/protected routes and critical workflows. Run `npm run test:e2e`; retain manual keyboard and screen-reader review.             |
| `msw`                                                     | Network-level API mocks in tests                       | Mock HTTP responses at the boundary, including failure states. Do not keep production mock arrays inside data-access services.            |
| `openapi-typescript`                                      | TypeScript types generated from an OpenAPI contract    | Run `npm run openapi:generate`. Treat generated files as read-only and keep feature data-access wrappers hand-written.                    |

## Decision rules

1. Use Angular and browser APIs first; add a package only for a demonstrated gap.
2. Any new dependency needs an owner, a security/license review, a bundle-size assessment, and a documented reason in its pull request.
3. Never add a state-management framework, UI framework, HTTP client, icon library, or crypto library without an explicit architecture decision.
4. Keep versions aligned with the existing Angular major version. Update lockfiles through `npm`, then run the full quality gate and audit.
5. The reference application may use mocks to demonstrate structure, but production features must replace them with typed backend adapters.

## Included engineering batteries

- `npm run test:e2e` starts the application and runs Chromium browser tests, including axe WCAG A/AA scans.
- `msw` is the approved way to test external or internal HTTP scenarios without a real backend.
- `npm run openapi:generate` creates `src/app/generated/api-schema.ts` from `OPENAPI_SPEC` or `openapi/openapi.yaml`. Product teams supply the backend-owned contract.
- `PermissionService` exposes role checks for navigation and UI decisions. It does not replace backend authorization.
- `FeatureFlagService` provides a minimal injected flag map. Keep flags named, owned, and removed when their rollout is complete.

See the [Engineering Guide](engineering-guide.md) for the project architecture and pull-request checklist.
