# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"ME by Svelpy" web client: digital business cards (vCards) for professionals. Each professional (role `user`) edits their card in the panel (`/panel`); anyone opens it read-only at `/{slug}` (e.g. `me.svelpy.com/dra-ana-perez`), with its own palette, typography, SEO and GEO (JSON-LD). Admins (`admin`, `superadmin`) manage every account, card, payment and plan. The backend is a separate FastAPI API; **its contract is `data-vcard-me-api.json`** (OpenAPI 3.1, paths under `/api/v1`). UI text, code comments and domain names are in **Spanish**; keep new code consistent with that.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`, `engineStrict`).

```sh
pnpm dev                 # vite dev server (against VITE_API_ENDPOINT from .env)
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

# E2E (Playwright builds against the test API and previews on :4173; files match **/*.e2e.{ts,js})
pnpm exec playwright test -g "<test name>"
```

Vitest has two projects (see `vite.config.ts`): `client` runs `*.svelte.{test,spec}.ts` in headless Chromium via `vitest-browser-svelte`; `server` runs other `*.{test,spec}.ts` in node. `expect.requireAssertions` is on — every test must assert. `vitest.setup.client.ts` defines the global that SvelteKit 3's `$app/env/public` reads in dev, so components that use it can be tested. In this Vitest version `toHaveTextContent('x')` matches the **whole** text and regex arguments don't work: assert text with `getByText()` locators instead.

### UI testing rule

Every UI change (new page, component or user flow) must ship with a Playwright test, and the task is not done until it passes:

- **Pages and flows** (navigation, forms, login, redirects by role): E2E test in a `*.e2e.ts` file, run with `pnpm exec playwright test`. It never touches the real API. `playwright.config.ts` starts `tests/apiPublica.mjs` on :4010 (only the public card routes, which the server renders — `page.route()` can't see SSR requests) and builds the app with `VITE_API_ENDPOINT=http://localhost:4010/api/v1`. Everything the browser asks is answered by `apiFalsa(page)` (`src/routes/e2e.api.ts`): an in-memory API built from the OpenAPI examples (`tests/fixtures/api.ejemplos.json`) with its accounts in `CUENTAS`; `api.llamadasA(metodo, ruta)` lets a test assert what was sent. Extend it when a flow needs a new endpoint.
- **Isolated components** (`src/lib/components/**`): browser test in `*.svelte.spec.ts` next to the component, using `vitest-browser-svelte` (also runs on Playwright/Chromium). `components/features/tarjeta/tarjetaDePrueba.ts` builds complete fixtures (`tarjetaCompletaDePrueba`, `tarjetaDePrueba` = the public shape, `cuentaDePrueba`, `planDePrueba`).
- Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`) over CSS selectors. Labels of required fields end with ` *` (use a regex such as `getByLabel(/^Correo/)` when matching exactly).

## Toolchain specifics (SvelteKit 3 / Svelte 5)

- **No `svelte.config.js`**: SvelteKit options (adapter, compiler options) live in the `sveltekit({...})` plugin call in `vite.config.ts`. Runes mode is forced for all project files — use `$props`, `$state`, `$derived`, snippets (`{@render}`), not legacy `export let`/slots.
- **Imports use `#lib/...` (Node subpath imports in `package.json`), not `$lib`**, and include the explicit `.ts` extension, e.g. `import { can } from '#lib/utils/rbac.utils.ts'`. Each folder has an `index.ts` barrel (`#lib/services/index.ts`, `#lib/interfaces/index.ts`, ...). A rune module `x.svelte.ts` must not share its base name with a component `x.svelte` (the import would resolve to the component).
- Env/runtime modules are the SvelteKit 3 forms: `$app/env` (`browser`, `dev`) and `$app/env/public` (`VITE_API_ENDPOINT` — includes `/api/v1` —, `PUBLIC_SITE_URL`, `PUBLIC_GA_ID`; see `.env.example`). They are static: baked in at build time, so `pnpm run deploy` needs the production values. `goto()` options are `replace` and `reset` (not `replaceState`/`keepFocus`/`noScroll`).
- Routing is type-checked: `resolve()` from `$app/paths` and `RouteId` from `$app/types` only accept routes that exist under `src/routes`. Use `resolveStaticRoute()` (`src/lib/utils/resolveRoute.ts`) when the route is held in a `StaticRouteId`-typed variable, and `rutaConQuery(resolve(...), { … })` for an internal link with a query string. Components that receive internal links type them as `ResolvedPathname`; links that leave the app use `rel="external noopener noreferrer"` (both satisfy `svelte/no-navigation-without-resolve`).
- Tailwind v4, configured CSS-first in `src/routes/layout.css`: landing tokens (`primary-*` plum, `secondary` orange), panel tokens `light-*`/`dark-*` (dark mode is the `.dark` class on `<html>`, applied before first paint by `src/app.html` and kept by `stores/temaUi.ts`), and card tokens `t-*` (`bg-t-fondo`, `text-t-titulo`, `font-t-titulos`…) that read the `--t-*` variables each card sets. Prettier sorts classes using that stylesheet. Merge classes with `cn()` (`clsx` + `tailwind-merge`). Prettier: tabs, single quotes, no trailing commas, width 100.
- ESLint ignores bindings prefixed with `_` and rest-sibling omissions (`const { password_hash: _h, ...usuario } = fila`).

## Architecture

**API layer** — Services (`src/lib/services/*.service.ts`, one per resource, exported as singletons: `authService`, `usuarioService`, `tarjetaService`, `tarjetaThemeService`/`tarjetaSeoService`/`vitrinaService` in `tarjetaPartes.service.ts`, `imagenService`, `planService`, `pagoService`) call `http` from `src/lib/config/http.config.ts` = `apiMeSvelpy` (`apiMeSvelpy.config.ts`: Bearer token, JSON or `FormData` bodies, timeout, 2xx without body → `undefined`, one refresh-and-retry on 401 unless `reintentar401: false`, optional `fetch` for SSR loads). Collection routes keep FastAPI's trailing slash (`/usuarios/`, `/tarjetas/`, `/planes/`, `/pagos/`); build queries with `conQuery()` (`api.config.ts`). **Every error is an `AppError`.** Request/response types for every endpoint live in `src/lib/interfaces/` and mirror the OpenAPI schemas (comments name the schema). **Every request body has `additionalProperties: false`**: never spread a response into a request; build it field by field (`utils/tarjetaNested.ts` does it for nested lists).

**Errors** — `src/lib/services/error.service.ts`: `AppError` (`code`, `status`, `details`, `isOperational` = 4xx). `fromResponse` normalizes `details` keys from the API's `"contactos -> 0 -> valor"` to `contactos.0.valor`, and FastAPI's `{ detail: [{ loc, msg }] }` to the same per-field shape. Use `errorService.getMessage(err, overrides?)` for user-facing text (backend message only for 4xx, generic text otherwise) and `errorService.getFieldErrors(err)` to map them to form fields. `ErrorCode` in `src/lib/interfaces/error.interface.ts`.

**Auth** — `auth.service.ts` stores the access token, CSRF token and user in `localStorage` (keys `me::auth::*` in `src/lib/constants/keys.ts`, only in the browser); the refresh token is an HttpOnly cookie (`withCredentials`). Refresh is de-duplicated in-process and serialized across tabs with the Web Locks API. Login is `POST /auth/login` (JSON); then one `GET /usuarios/me` brings the user, its plan and its whole card: `stores/auth.store.ts` keeps `currentUserStore` (`{ user: UsuarioDetalle, tarjeta: TarjetaResumen | null }`) and `stores/miTarjeta.store.ts` the full card; `authStore.ensureSession()` re-validates once per app load. Sign-up (`/auth/sign-up`, 3 steps, `?enlace=` prefills the link) calls `POST /auth/register` (201, no session, unverified email) and then logs in; the card starts with the rubro's preset and its typography is applied right after (`utils/temaInicial.ts`). Email flows: `/auth/forgot-password`, `/auth/reset-password?token=`, `/auth/verify-email?token=` (the backend's emails link there; the auth layout only redirects logged-in users away from sign-in/sign-up/forgot). `POST /auth/change-password` returns new tokens, so the session stays open. The slug field everywhere is `CampoEnlace` (local format check, live `GET /tarjetas/public/slug-disponible/{slug}`, client-side one-click alternative). `utils/signInReason.ts` builds the login URL with `?motivo=protegida|expirada|password`.

**Authorization (UI only; the backend enforces the real security)** — roles are `superadmin` (everything), `admin` (everything but deleting accounts and cards) and `user` (only their own card), with hierarchy `RANGO_ROL`:

- `src/lib/config/permissions.config.ts`: `Role`, `Module` (includes `PLAN`, `PAGO`, `MANTENIMIENTO`), `Action` and `ROLE_PERMISSIONS`. `CAMBIAR_SLUG_ROLES` (admins only), `ASSIGNABLE_USER_ROLES`. Check with `can(role, module, action)` or `<Can module action>`; `getAssignableUserRoles(actor)` and `puedeGestionarCuenta(actor, rol)` only allow lower ranks (like the API). `components/features/usuarios/acciones.ts` decides which account actions an actor sees.
- `src/lib/config/routeAccess.config.ts`: `ROLE_ACCESS` — admins open all of `/panel` except `/panel/mi-tarjeta`; the user opens `/panel/mi-tarjeta` (home) and `/panel/cuenta`.
- `src/lib/utils/routeGuard.ts`: `guardRoute(event)` is called from `routes/panel/+layout.ts`.
- `src/lib/config/navigation.config.ts`: `PANEL_NAVIGATION` and `PANEL_DISENO` (admins get the sidebar shell, the user a top bar with the email-verification strip); `filterNavigation` hides items via `canAccessRoute`.
- Tests: `src/lib/utils/rbac.utils.spec.ts`.

**Plans and payments** — plans are API rows (`GET /planes/`, codes `free`/`pro`); a user has `plan_id`, `plan` and `plan_vence_at` (never null). List items bring the plan as `{ id, nombre }` only: `stores/planes.store.ts` caches the catalog. `config/planes.config.ts`: `bloqueoPublicacion(cuenta)` → `cuenta-de-baja | plan-free | plan-vencido | email-sin-verificar | null` (what `POST /tarjetas/{id}/publicar` requires), `estadoPlan`, `vencePronto`. A plan is renewed only by registering a payment (`/panel/pagos/nuevo`, one `idempotency_key` per form) and discounted by annulling it. UI: `components/features/planes/` (`EstadoPlan`, `AvisoPublicacion`: the blocking reason with its one action), `components/features/pagos/` (`TablaPagos`, `ReciboPago`, `RegistrarPagoForm`), `utils/plan.ts`.

**Cards** — `components/features/tarjeta/`: `TarjetaVista` renders `TarjetaPublica`, the API's public shape (only visible rows, already ordered). The editor's mirror uses `aPublica(completa)` (`utils/tarjeta.ts`), so the preview is exactly what gets published. Theme as `--t-*` variables (`utils/temaTarjeta.ts`), the local font pair chosen by the numeric `tipografia` (`config/tipografiasTarjeta.config.ts`), 8 sections (`config/seccionesTarjeta.config.ts`; "Pagar con QR" and "Agendar cita" live in Contacto). `/[slug]` renders on the server (crawlers get SEO and JSON-LD in the HTML); the QR encodes `/t/{id}` (`routes/t/[id]`), which redirects to the current slug. SEO/GEO: `TarjetaSeo` + `utils/seoTarjeta.ts` + `utils/jsonLdTarjeta.ts`. `config/temasTarjeta.config.ts` has the 10 presets (local preview data, contrast-tested); `config/rubros.config.ts` the rubros. Prices and coordinates arrive as strings (`numeroDe()`). Images are shrunk per use and uploaded with `imagenService.subir(file, tipo)` (`utils/imagen.ts`, ≤5 MB, no SVG).

**Panel** — the card editor (`components/features/editor/`) is shared by `/panel/mi-tarjeta` (user) and `/panel/tarjetas/[id]` (admins, loads `GET /tarjetas/{id}/completa` + the owner). Its state is `EditorTarjeta` (`estadoEditor.svelte.ts`, context): writes are queued; `guardarDatos` (scalar fields), `servicioLista(clave)` / `servicioVitrina(clave)` (each list is sent whole as its final state in `PATCH /tarjetas/{id}` or `PATCH /vitrinas/{id}`; hide/move/delete are optimistic), `guardarSecciones` (always the 8), `guardarTheme` (only what changed — the API sets `preset` to null when colors are sent, so the UI recognizes it with `presetCoincidente()`), `guardarSeo`, `publicar`/`despublicar`. Admin pages: `/panel` (totals from list `total`s + maintenance actions), `/panel/tarjetas` (filters `estado`, `cuenta`), `/panel/tarjetas/nueva`, `/panel/usuarios` (filters rol/plan/estado; dialogs in `usuarios/dialogosCuenta.svelte`), `/panel/usuarios/[id]` (account, its card and payments), `/panel/usuarios/nuevo` (account, then its card; if the card fails the account stays and only the card is retried), `/panel/pagos`, `/panel/pagos/nuevo`, `/panel/planes`.

**Forms** — Zod schemas in `src/lib/zod/` (limits from `constants/limites.ts`, the API's `maxItems`), validated with `validateSchema(schema, data)` → `{ success, data } | { success: false, errors }` (first message per field, dotted paths), or with `EstadoFormulario` (`components/features/editor/estadoFormulario.svelte.ts`) which also maps API field errors. Toasts via `alert(type, text)` (`src/lib/utils/alert.ts`, Notyf, browser-only).

**UI** — the panel kit is in `src/lib/components/ui/` (exported from its `index.ts`), skeletons in `components/skeletons/`, layout/SEO wrapper `MainLayout` in `components/layout/`, feature components under `components/features/<feature>/` (`auth/PantallaAuth` frames the email screens). The public card uses its own primitives in `components/features/tarjeta/ui/` (they read the card's palette, not the panel's). Icons are one Svelte component each in `src/lib/icons/{outline,solid}/` with barrel exports. Brand logos live in `static/images/landing/`.

## Current state

The whole app runs against the real API. Known pending items:

- `pnpm check` has one error, in `components/features/legal/legalLinks.svelte` (the legal pages don't exist yet).
- `pnpm exec eslint` reports 5 errors in older code: an unresolved `href` in `ui/button.svelte`, `any` in `ui/card.svelte`, an unused `color` prop in `ui/heading.svelte`, unused `className` in `icons/solid/statsIcon.svelte`, and `goto` in `utils/redirect.ts`.
- Deploy target is **Cloudflare Workers** (not Pages): `wrangler.jsonc` has `main` + `assets` and `compatibility_flags: ["nodejs_compat"]` (SvelteKit's runtime uses `node:async_hooks`) and the custom domain `me.svelpy.com` in `routes`. `src/env.ts` validates `PUBLIC_SITE_URL` and `VITE_API_ENDPOINT` at build time (https, `…/api/v1`), so a missing build variable fails the deploy. Code that ends up in the server bundle (anything `/[slug]` renders) must not pull Node-only packages: `ui/qrCode.svelte` imports only `qrcode/lib/core/qrcode.js` for that reason. Check with `pnpm build` + `pnpm exec wrangler deploy --dry-run`.
- Production needs, on the backend: CORS with credentials for the site's origin and the refresh cookie as `SameSite=None; Secure`.
