# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"ME by Svelpy" web client: digital business cards (vCards) for professionals. Each professional (role OWNER) edits their card in the panel (`/panel`); anyone opens it read-only at `/{slug}` (e.g. `me.svelpy.com/doctora-fabiola`), with its own palette, typography, SEO and GEO (JSON-LD). A SUPERADMIN manages every account and card. The data model is in `database-models.md`; the real backend is a separate FastAPI API. UI text, code comments and domain names are in **Spanish**; keep new code consistent with that.

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

Vitest has two projects (see `vite.config.ts`): `client` runs `*.svelte.{test,spec}.ts` in headless Chromium via `vitest-browser-svelte`; `server` runs other `*.{test,spec}.ts` in node. `expect.requireAssertions` is on — every test must assert. `vitest.setup.client.ts` defines the global that SvelteKit 3's `$app/env/public` reads in dev, so components that use it can be tested. In this Vitest version `toHaveTextContent('x')` matches the **whole** text and regex arguments don't work: assert text with `getByText()` locators instead.

### UI testing rule

Every UI change (new page, component or user flow) must ship with a Playwright test, and the task is not done until it passes:

- **Pages and flows** (navigation, forms, login, redirects by role): E2E test in a `*.e2e.ts` file, run with `pnpm exec playwright test`. It runs against the production build (`build` + `preview` on :4173). While the app runs on the mock backend (see below), E2E tests log in with the seeded accounts (`src/routes/e2e.utils.ts`); once on the real API, mock it with `page.route()` instead of depending on it.
- **Isolated components** (`src/lib/components/**`): browser test in `*.svelte.spec.ts` next to the component, using `vitest-browser-svelte` (also runs on Playwright/Chromium). `components/features/tarjeta/tarjetaDePrueba.ts` builds a complete card for these tests (independent from the mocks).
- Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`) over CSS selectors. Labels of required fields end with ` *` (use a regex such as `getByLabel(/^Correo/)` when matching exactly).

## Toolchain specifics (SvelteKit 3 / Svelte 5)

- **No `svelte.config.js`**: SvelteKit options (adapter, compiler options) live in the `sveltekit({...})` plugin call in `vite.config.ts`. Runes mode is forced for all project files — use `$props`, `$state`, `$derived`, snippets (`{@render}`), not legacy `export let`/slots.
- **Imports use `#lib/...` (Node subpath imports in `package.json`), not `$lib`**, and include the explicit `.ts` extension, e.g. `import { can } from '#lib/utils/rbac.utils.ts'`. Each folder has an `index.ts` barrel (`#lib/services/index.ts`, `#lib/interfaces/index.ts`, ...). A rune module `x.svelte.ts` must not share its base name with a component `x.svelte` (the import would resolve to the component).
- Env/runtime modules are the SvelteKit 3 forms: `$app/env` (`browser`, `dev`) and `$app/env/public` (`VITE_API_ENDPOINT`, `PUBLIC_SITE_URL` from `.env`). `goto()` options are `replace` and `reset` (not `replaceState`/`keepFocus`/`noScroll`).
- Routing is type-checked: `resolve()` from `$app/paths` and `RouteId` from `$app/types` only accept routes that exist under `src/routes`. Use `resolveStaticRoute()` (`src/lib/utils/resolveRoute.ts`) when the route is held in a `StaticRouteId`-typed variable. Components that receive internal links type them as `ResolvedPathname`; links that leave the app use `rel="external noopener noreferrer"` (both satisfy `svelte/no-navigation-without-resolve`).
- Tailwind v4, configured CSS-first in `src/routes/layout.css`: landing tokens (`primary-*` plum, `secondary` orange), panel tokens `light-*`/`dark-*` (dark mode is the `.dark` class on `<html>`, applied before first paint by `src/app.html` and kept by `stores/temaUi.ts`), and card tokens `t-*` (`bg-t-fondo`, `text-t-titulo`, `font-t-titulos`…) that read the `--t-*` variables each card sets. Prettier sorts classes using that stylesheet. Merge classes with `cn()` (`clsx` + `tailwind-merge`). Prettier: tabs, single quotes, no trailing commas, width 100.
- ESLint ignores bindings prefixed with `_` and rest-sibling omissions (`const { password_hash: _h, ...usuario } = fila`).

## Architecture

**API layer** — Services (`src/lib/services/*.service.ts`, exported as singletons) call `http` from `src/lib/config/http.config.ts`, which re-exports either the mock backend or the real client `apiMeSvelpy` (`apiMeSvelpy.config.ts`: Bearer token, `FormData`/`URLSearchParams` bodies, timeout, one refresh-and-retry on 401). Both implement the same `HttpClient` type. **Every error is an `AppError`.** Request/response types for every endpoint live in `src/lib/interfaces/` and are the contract with the backend.

**Mock backend (temporary)** — `src/lib/mocks/`: a REST router over tables stored in `localStorage` (`me::mock::*`), one file per model in `mocks/modelos/` (list, get, create, update, logical delete, reorder), backend-like rules (nested creation in one request with rollback, cascading soft delete, 409/403/404/422 with `details` per field, SHA-256 passwords) and seed data in `mocks/seed/` (`VERSION_DATOS` reseeds every browser when bumped). Test accounts: `superadmin@me.test` / `Admin1234`, owners `fabiola@me.test`, `camila@me.test`… / `Demo1234` (`mocks/seed/usuarios.seed.ts`). To switch to the real API: (1) in `http.config.ts` export `apiMeSvelpy as http`; (2) delete `src/lib/mocks/` and the `<DemoAccounts />` import in `routes/auth/sign-in/+page.svelte`; (3) remove `ssr = false` from `routes/[slug]/+page.ts` so crawlers get the card's SEO in the HTML.

**Errors** — `src/lib/services/error.service.ts`: `AppError` (`code`, `status`, `details`, `isOperational` = 4xx). Use `errorService.getMessage(err, overrides?)` for user-facing text (backend message only for 4xx, generic text otherwise) and `errorService.getFieldErrors(err)` to map API `details` (dotted paths like `tarjeta.contactos.0.valor`) to form fields. `ErrorCode` in `src/lib/interfaces/error.interface.ts` mirrors the backend.

**Auth** — `auth.service.ts` stores the access token, CSRF token and user in `localStorage` (keys `me::auth::*` in `src/lib/constants/keys.ts`); the refresh token is an HttpOnly cookie. Refresh is de-duplicated in-process and serialized across tabs with the Web Locks API. `src/lib/stores/auth.store.ts` exposes `currentUserStore` (`{ user, tarjeta: TarjetaResumen | null }`), `currentRole`, `isAuthenticated` and `authStore.ensureSession()`, which re-validates against `/users/me` once per app load. For an OWNER, login also loads the whole card with one request (`GET /tarjetas/mia`) into `stores/miTarjeta.store.ts`. `utils/signInReason.ts` builds the login URL with `?motivo=protegida|expirada|password`.

**Authorization (UI only; the backend enforces the real security)** — roles are `SUPERADMIN` and `OWNER`:

- `src/lib/config/permissions.config.ts`: `Role`, `Module`, `Action` and `ROLE_PERMISSIONS` — a mirror of the backend's permissions; change both together. Special lists: `CAMBIAR_SLUG_ROLES` (only SUPERADMIN changes a card's slug), `ASSIGNABLE_USER_ROLES`. Check with `can(role, module, action)` or the `<Can module action>` component.
- `src/lib/config/routeAccess.config.ts`: `ROLE_ACCESS` — SUPERADMIN opens all of `/panel` except `/panel/mi-tarjeta`; OWNER opens `/panel/mi-tarjeta` (home) and `/panel/cuenta`.
- `src/lib/utils/routeGuard.ts`: `guardRoute(event)` is called from `routes/panel/+layout.ts`; it redirects to the login without a session, or to the role's home without access.
- `src/lib/config/navigation.config.ts`: `PANEL_NAVIGATION` and `PANEL_DISENO` (SUPERADMIN gets the sidebar shell, OWNER a top bar); `filterNavigation` hides items via `canAccessRoute`.
- Tests: `src/lib/utils/rbac.utils.spec.ts`.

**Cards** — `components/features/tarjeta/`: `TarjetaVista` renders a card (public or `vista-previa` for the editor's phone mirror) with the theme as `--t-*` variables (`utils/temaTarjeta.ts`), the local font pair chosen by id (`config/tipografiasTarjeta.config.ts`, files from `@fontsource-variable/*`), and visible sections in their `orden` (`config/seccionesTarjeta.config.ts`, 9 keys). SEO/GEO: `TarjetaSeo` + `utils/seoTarjeta.ts` + `utils/jsonLdTarjeta.ts` (Person + business typed by rubro + FAQPage). `config/temasTarjeta.config.ts` has the 10 presets (contrast-tested); `config/rubros.config.ts` is the production list of rubros, each suggesting a preset, a typography, a vitrina title and a Schema.org type. "Guardar contacto" downloads a vCard 3.0 (`utils/vcard.ts`).

**Panel** — the card editor (`components/features/editor/`) is shared by `/panel/mi-tarjeta` (owner) and `/panel/tarjetas/[id]` (superadmin): section index (`?seccion=` in the URL), one pane per part/section, and a live phone mirror. Its state is the `EditorTarjeta` class in `estadoEditor.svelte.ts` (context). Superadmin pages: `/panel` (summary), `/panel/tarjetas` (directory with filters in the URL), `/panel/tarjetas/nueva`, `/panel/usuarios`, `/panel/usuarios/nuevo` (account + card + contacts + socials in one request).

**Forms** — Zod schemas in `src/lib/zod/`, validated with `validateSchema(schema, data)` → `{ success, data } | { success: false, errors }` (first message per field, dotted paths), or with `EstadoFormulario` (`components/features/editor/estadoFormulario.svelte.ts`) which also maps API field errors. Toasts via `alert(type, text)` (`src/lib/utils/alert.ts`, Notyf, browser-only).

**UI** — the panel kit is in `src/lib/components/ui/` (exported from its `index.ts`), skeletons in `components/skeletons/`, layout/SEO wrapper `MainLayout` in `components/layout/`, feature components under `components/features/<feature>/`. The public card uses its own primitives in `components/features/tarjeta/ui/` (they read the card's palette, not the panel's). Icons are one Svelte component each in `src/lib/icons/{outline,solid}/` with barrel exports. Brand logos live in `static/images/landing/`.

## Current state

The panel, login and public card run on the mock backend. Known pending items:

- `pnpm check` has one error, in `components/features/legal/legalLinks.svelte` (the legal pages don't exist yet).
- `landing.e2e.ts` still expects the old landing title (`ME | Tarjeta digital profesional con SEO y GEO`); the title in `landing.content.ts` is now `ME | Tarjeta digital profesional`.
- `pnpm exec eslint` reports 5 errors in older code: an unresolved `href` in `ui/button.svelte`, `any` in `ui/card.svelte`, an unused `color` prop in `ui/heading.svelte`, unused `className` in `icons/solid/statsIcon.svelte`, and `goto` in `utils/redirect.ts`.
