/**
 * Backend simulado de ME (datos de prueba). Guarda una tabla por modelo en localStorage y
 * responde con el mismo contrato que la API real (`src/lib/interfaces`), incluidos los errores.
 *
 * Para usar la API real se borra esta carpeta completa: ver `src/lib/config/http.config.ts`.
 *
 * - `modelos/*.mock.ts`: un archivo por tabla con su CRUD (borrado lógico) y sus rutas REST.
 * - `seed/`: cuentas y tarjetas de prueba (`usuarios.seed.ts` es la lista para iniciar sesión).
 * - `demoAccounts.svelte`: atajo del login para entrar con una cuenta de prueba.
 */
export { mockHttp } from './http.mock';
export { prepararDatosDePrueba, restablecerDatosDePrueba } from './seed';
export { CUENTAS_DE_PRUEBA, type CuentaDePrueba } from './seed/usuarios.seed';
