/**
 * Pruebas de componentes en el navegador (proyecto `client` de Vitest).
 *
 * En desarrollo, el módulo que genera SvelteKit 3 para `$app/env/public` empieza con
 * `const { env } = globalThis.__sveltekit_dev;` (el objeto lo crea su servidor en el HTML). Vitest no
 * pasa por ese servidor, así que se define vacío: las variables públicas estáticas (PUBLIC_SITE_URL…)
 * ya vienen escritas en el módulo y no lo necesitan.
 */
const global = globalThis as typeof globalThis & {
	__sveltekit_dev?: { env: Record<string, string> };
};
global.__sveltekit_dev ??= { env: {} };
