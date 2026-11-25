// Claves de localStorage y Web Locks de ME. Prefijo `me::` para no chocar con otras apps del dominio.

export const ACCESS_TOKEN_KEY = 'me::auth::at';
/** El CSRF token que acompaña al refresh token (este vive en una cookie HttpOnly) */
export const CSRF_TOKEN_KEY = 'me::auth::csrf';
export const USER_DATA_KEY = 'me::auth::ud';
// Nombre del Web Lock que serializa el refresh del token entre pestañas
export const REFRESH_LOCK_KEY = 'me::auth::refresh';

/** Modo de color del panel: 'claro' | 'oscuro' | 'sistema'. Lo lee también el script de app.html */
export const TEMA_UI_KEY = 'me::ui::tema';
