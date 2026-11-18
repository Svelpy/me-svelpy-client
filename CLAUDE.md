# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"ME by Svelpy" web client: a SvelteKit SPA-style frontend for a customer-loyalty platform (points, redemptions/"canjes", vouchers/"vales", businesses, branches). It talks to a separate FastAPI backend. UI text, code comments and domain names are in **Spanish**; keep new code consistent with that.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`, `engineStrict`).

```sh
pnpm dev                 # vite dev server
pnpm build / pnpm preview
pnpm run deploy          # build + wrangler deploy (Cloudflare Workers, config in wrangler.jsonc)
pnpm check               # svelte-kit sync + svelte-check (type checking)
pnpm lint                # prettier --check + eslint
pnpm format              # prettier --write
pnpm test:unit           # vitest (watch mode)
pnpm test                # unit (run once) + e2e

# Single unit test file / single test
pnpm vitest run src/lib/utils/rbac.utils.spec.ts
pnpm vitest run src/lib/utils/rbac.utils.spec.ts -t "canAccessRoute"
pnpm vitest run --project server        # only node tests ("client" = browser tests)

# E2E (Playwright builds + previews on :4173; files match **/*.e2e.{ts,js})
pnpm exec playwright test -g "<test name>"
```

Vitest has two projects (see `vite.config.ts`): `client` runs `*.svelte.{test,spec}.ts` in headless Chromium via `vitest-browser-svelte`; `server` runs other `*.{test,spec}.ts` in node. `expect.requireAssertions` is on — every test must assert.

### UI testing rule

Every UI change (new page, component or user flow) must ship with a Playwright test, and the task is not done until it passes:
- **Pages and flows** (navigation, forms, login, redirects by role): E2E test in a `*.e2e.ts` file, run with `pnpm exec playwright test`. It runs against the production build (`build` + `preview` on :4173), so mock the backend with `page.route()` instead of depending on the real API.
- **Isolated components** (`src/lib/components/**`): browser test in `*.svelte.spec.ts` next to the component, using `vitest-browser-svelte` (also runs on Playwright/Chromium).
- Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`) over CSS selectors.

## Toolchain specifics (SvelteKit 3 / Svelte 5)

- **No `svelte.config.js`**: SvelteKit options (adapter, compiler options) live in the `sveltekit({...})` plugin call in `vite.config.ts`. Runes mode is forced for all project files — use `$props`, `$state`, `$derived`, snippets (`{@render}`), not legacy `export let`/slots.
- **Imports use `#lib/...` (Node subpath imports in `package.json`), not `$lib`**, and include the explicit `.ts` extension, e.g. `import { can } from '#lib/utils/rbac.utils.ts'`. Each folder has an `index.ts` barrel (`#lib/services/index.ts`, `#lib/interfaces/index.ts`, ...).
- Env/runtime modules are the SvelteKit 3 forms: `$app/env` (`browser`, `dev`) and `$app/env/public` (`VITE_API_ENDPOINT`, `PUBLIC_SITE_URL` from `.env`).
- Routing is type-checked: `resolve()` from `$app/paths` and `RouteId` from `$app/types` only accept routes that exist under `src/routes`. Use `resolveStaticRoute()` (`src/lib/utils/resolveRoute.ts`) when the route is held in a `StaticRouteId`-typed variable.
- Tailwind v4, configured CSS-first in `src/routes/layout.css` (`@theme` brand tokens: `primary-*` plum, `secondary` orange, fonts). Prettier sorts classes using that stylesheet. Merge classes with `cn()` (`clsx` + `tailwind-merge`). Prettier: tabs, single quotes, no trailing commas, width 100.

## Architecture

**API layer** — `src/lib/config/apiMeSvelpy.config.ts` is the single HTTP client (`get/post/put/patch/delete/getBlob`, plus `getPublic/postPublic` for unauthenticated calls). It attaches the Bearer token, handles `FormData`/`URLSearchParams` bodies, applies a timeout, and on a 401 refreshes the token once and retries. **Every error leaving it is an `AppError`.** Domain services (`src/lib/services/*.service.ts`) wrap it and are exported as singletons.

**Errors** — `src/lib/services/error.service.ts`: `AppError` (`code`, `status`, `details`, `isOperational` = 4xx). Use `errorService.getMessage(err, overrides?)` for user-facing text (backend message only for 4xx, generic text otherwise) and `errorService.getFieldErrors(err)` to map API `details` to form fields. `ErrorCode` in `src/lib/interfaces/error.interface.ts` mirrors the backend.

**Auth** — `auth.service.ts` stores the access token, CSRF token and user in `localStorage` (keys in `src/lib/constants/keys.ts`); the refresh token is an HttpOnly cookie. Refresh is de-duplicated in-process and serialized across tabs with the Web Locks API. `src/lib/stores/auth.store.ts` exposes `currentUserStore`, `currentRole`, `isAuthenticated` and `authStore.ensureSession()`, which re-validates against `/users/me` once per app load so the role never comes only from localStorage.

**Authorization (UI only; the backend enforces the real security)** — two independent configs:
- `src/lib/config/permissions.config.ts`: `Role`, `Module`, `Action` and `ROLE_PERMISSIONS` — a mirror of the backend's `shared/services/permissions.py`; change both together. Also role hierarchy (`ROLE_LEVEL`) and special role lists. Check with `can(role, module, action)` or the `<Can module action>` component (`src/lib/components/auth/can.svelte`).
- `src/lib/config/routeAccess.config.ts`: `ROLE_ACCESS` — which pages (SvelteKit route ids) each role may open, its `home`, plus `exactRoutes`/`excludedRoutes`.
- `src/lib/utils/routeGuard.ts`: `guardRoute(event)` is meant to be called from an area's `+layout.ts` `load`; it redirects to `/auth/sign-in?redirectTo=...` without a session, or to the role's home without access. Route groups `(x)` are stripped before matching.
- `src/lib/config/navigation.config.ts`: `PANEL_NAVIGATION` (admin panel `/panel` sidebar) and `CLIENT_NAVIGATION` (customer area `/app`); `filterNavigation` hides items via `canAccessRoute`, so access rules are defined once.
- Tests for all of this: `src/lib/utils/rbac.utils.spec.ts`.

**Forms** — Zod schemas in `src/lib/zod/`, validated with `validateSchema(schema, data)` → `{ success, data } | { success: false, errors }` (first message per field). Toasts via `alert(type, text)` (`src/lib/utils/alert.ts`, Notyf, browser-only).

**UI** — reusable components in `src/lib/components/ui/` (exported from its `index.ts`), layout/SEO wrapper `MainLayout` in `components/layout/`, feature components under `components/features/<feature>/`. Icons are one Svelte component each in `src/lib/icons/{outline,solid}/` with barrel exports. Brand logos live in `static/images/`.

## Current state

The `src/lib` code was ported from a previous project and the routes are not built yet (`src/routes` only has the starter page). As of now `pnpm check` fails because of that: `/panel`, `/app` and `/auth/*` routes don't exist (breaking typed `resolve()`/`RouteId` usages), `apiMeSvelpy.config.ts` still exports `apiFidelityTupa` while services import `apiMeSvelpy`, `perfilService` is referenced but missing, `+layout.svelte` imports a nonexistent `./demo/DemoLinks.svelte`, `zod`/`qrcode` need `pnpm install`, and some leftover branding remains (`APP_SITE_CONFIG` in `src/lib/constants/assets.ts`, `fftp::` storage keys, `light-*`/`dark-*` color classes not defined in the current theme).
