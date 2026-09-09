# Engineering Guide

## Build features in the established flow

Use `features/<feature>/` for business code. A page coordinates the view, a feature state service owns transitions and signals, and a data-access service owns backend calls.

```text
Page → feature state → data-access → ApiClient → interceptors → backend
```

Keep component-local UI state in signals. Do not import another feature’s internals; expose a narrow public contract when a cross-feature interaction is necessary.

## Page titles and breadcrumbs

The page title and breadcrumb trail are generated from route `data`; do not build a second breadcrumb in a feature page. Add `title`, `subtitle`, and `breadcrumb` on the route that owns the page. Parent routes automatically become navigable ancestors. If metadata is omitted, the service derives a readable label from the URL segment; use `breadcrumb: false` for technical routes that must stay out of the trail.

For detail routes, a label can use route parameters. Keep the function synchronous and presentation-only—fetching a record still belongs in the page or data-access service.

```ts
import { RouteLabelContext } from '@core/layout/breadcrumb.models';

data: {
  title: ({ params }: RouteLabelContext) => `Project ${params['id']}`,
  breadcrumb: ({ params }: RouteLabelContext) => `Project ${params['id']}`,
}
```

When the page loads the actual record name, call `setCurrentPageMetadata` with the request URL captured before the request. This replaces the temporary parameter label and ignores a late response after the user navigates away.

## HTTP, authentication, and configuration

Use `ApiClient` for internal APIs. It resolves paths from the validated public `app-config.json` and attaches authentication only to trusted internal origins. External integrations belong in a dedicated data-access service and must use their explicit external URL; they never receive internal credentials or correlation identifiers.

Set `authTransport` in each environment's public `app-config.json`; it is either `cookie` (the default) or `bearer`.

| Transport | What the starter sends                                                                    | Backend contract                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `cookie`  | `withCredentials` for trusted APIs                                                        | Issue an `HttpOnly; Secure; SameSite` session cookie and enforce CSRF protection. The starter configures `XSRF-TOKEN` / `X-XSRF-TOKEN`.    |
| `bearer`  | `Authorization: Bearer <access-token>` for trusted APIs, with request credentials omitted | Return a short-lived access token and the authenticated user after sign-in. Prefer an `HttpOnly` refresh cookie or a BFF refresh endpoint. |

For bearer APIs, keep the access token in memory only. After the backend sign-in response succeeds, establish the UI session with the returned user and token:

```ts
this.authSession.signInWithBearerToken(response.user, response.accessToken);
```

`signOut()` clears the in-memory token and user. On a `401`, call it before returning the user to sign-in. A full refresh also clears the token, so the product must restore the session through its backend refresh or sign-in flow. Route guards are user-experience controls, not authorization.

For a cross-origin bearer API, the backend must allow the application origin and `Authorization` header through CORS. Add only API origins that share the token audience to `trustedInternalOrigins`; the interceptor sends the token to every origin in that allow-list. This starter uses one transport per deployed product. A product needing an exception must add a reviewed, tested interceptor rather than bypassing this boundary in a feature.

Do not put secrets, API keys, passwords, access tokens, or refresh tokens in browser storage or runtime configuration.

## State, forms, and errors

Use a feature state service for data shared within a feature or with loading, saving, deleting, and error transitions. Use typed reactive forms for business forms. Handle expected validation errors near the form; do not reduce every failure to a toast.

```ts
readonly loading = this.loadingState.asReadonly();

async load(): Promise<void> {
  this.loadingState.set(true);
  try {
    this.itemsState.set(await firstValueFrom(this.api.list()));
  } finally {
    this.loadingState.set(false);
  }
}
```

## Everyday UI utilities

Use `markFormTouched(form)` when an invalid reactive form is submitted, and `isInvalid(control)` to show an error only after a field has been touched or changed. Pages that edit data should implement `hasUnsavedChanges()` and use `unsavedChangesGuard` on their route.

Use `app-page-state` for a full-page loading, empty, or retryable error state. Keep page-specific content in the page; the shared component only handles the state presentation.

`requireAnyRole()` and `requireFeature()` are route helpers for UI access and controlled rollout. They improve navigation only—the backend must still authorize every request. `AppErrorHandler` logs a safe, small error summary through `Logger`; replace or extend that adapter when production telemetry is selected.

`NetworkStatusService` exposes a reactive `online` signal. Use it to communicate connectivity loss; do not silently queue writes or claim an action was saved while offline.

## Copy these patterns

Use the supplied guards on the route, not inside a component. The backend must still enforce every permission.

```ts
import { requireAnyRole } from '@core/auth/role.guard';
import { requireFeature } from '@core/feature-flags/feature-flag.guard';
import { unsavedChangesGuard } from '@core/forms/unsaved-changes.guard';

{ path: 'users', canActivate: [requireAnyRole(['Admin'])], loadChildren: () => ... }
{ path: 'beta', canMatch: [requireFeature('beta-projects')], loadComponent: () => ... }
{ path: ':id/edit', canDeactivate: [unsavedChangesGuard], loadComponent: () => ... }
```

Pages protected by `unsavedChangesGuard` implement `hasUnsavedChanges(): boolean`. For forms, show validation only after the user has interacted or submitted:

```ts
if (form.invalid) {
  markFormTouched(form);
  return;
}
```

Use `PageStateComponent` for a page-level error, empty state, or loading state; feature-specific content stays in the page.

```html
<app-page-state
  state="error"
  title="Projects could not load"
  [description]="error()!"
  (retry)="reload()"
/>
```

The navigation drawer launcher is mobile-only (below `768px`). Tablet and desktop use the persistent sidebar, so do not add another drawer control to a feature page.

## Secure local preferences

`SecureStorageService` is only for non-auth cached preferences that genuinely need persistence. It uses AES-256-GCM, a unique 96-bit IV, authenticated metadata, and an IndexedDB-persisted non-extractable `CryptoKey`. It is not protection against XSS; never use it for credentials or secrets. Crypto failures must remain failures—never write plaintext as a fallback.

## Before every pull request

1. Add or update behavioural tests with the change.
2. Run the seven commands in the README.
3. Confirm no direct browser-storage access outside `core/security`, no feature-to-feature internal imports, and no direct `HttpClient` injection in components.
4. Keep generated code typed; do not introduce `any` or bypass linting.
5. Review the accessible name, keyboard flow, focus order, and error feedback for every interactive change.

The reference application is a pattern catalog, not a backend substitute. Copy its structure, then replace its mock data-access implementations with product-specific typed adapters.

## Delivery batteries

Use `PermissionService` for role-based UI decisions and `FeatureFlagService` for small, temporary rollouts. Neither is a backend security boundary. Use MSW to test HTTP success and failure scenarios at the network boundary. When a backend publishes an OpenAPI contract, run `npm run openapi:generate` and wrap the generated types in feature data-access services.

For user-critical changes, add or update a Playwright journey and run `npm run test:e2e`. The included axe scan catches automatically detectable WCAG A/AA violations; it complements, but never replaces, manual accessibility testing.

## Comments

Prefer self-explanatory names and small functions. Add a one-line comment only for non-obvious intent, a business rule, or a safety constraint. Do not narrate markup, restate code, or leave outdated implementation history in comments.
