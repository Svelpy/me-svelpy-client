/**
 * Para qué se sube una imagen. El backend no lo recibe: el frontend la achica según el uso antes de
 * subirla (`utils/imagen.ts`).
 */
export type ImagenTipo =
	'perfil' | 'agenda' | 'portada' | 'logo' | 'qr_pago' | 'vitrina' | 'og' | 'comprobante';

/**
 * `POST /imagenes/uploads` (`ImagenUploadResponse`): la URL queda pendiente hasta que un create o
 * update la use; si nadie la usa, la limpieza la borra.
 */
export interface ImagenUploadResponse {
	url: string;
}

/** `POST /imagenes/limpiar-huerfanas` */
export interface ImagenesHuerfanasResponse {
	/** Huérfanas que se borraron de Cloudinary */
	eliminadas: number;
	/** Pendientes que sí usa un registro y solo perdieron la etiqueta */
	conservadas: number;
}
