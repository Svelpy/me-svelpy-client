// Tipos del codificador de `qrcode` importado sin sus renderizadores (ver ui/qrCode.svelte).
// Es la misma función `create` que la entrada principal, así que reusa los tipos de @types/qrcode.
declare module 'qrcode/lib/core/qrcode.js' {
	export { create } from 'qrcode';
}
