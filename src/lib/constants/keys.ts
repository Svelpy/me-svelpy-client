// Claves de localStorage y Web Locks de ME. Prefijo `me::` para no chocar con otras apps del dominio.

export const ACCESS_TOKEN_KEY = 'me::auth::at';
export const REFRESH_TOKEN_KEY = 'me::auth::rt';
export const USER_DATA_KEY = 'me::auth::ud';
// Nombre del Web Lock que serializa el refresh del token entre pestañas
export const REFRESH_LOCK_KEY = 'me::auth::refresh';

/** Modo de color del panel: 'claro' | 'oscuro' | 'sistema'. Lo lee también el script de app.html */
export const TEMA_UI_KEY = 'me::ui::tema';
