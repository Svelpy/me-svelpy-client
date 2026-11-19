/** Para qué se sube la imagen: el backend decide tamaño y recorte según el tipo */
export type UploadTipo = 'perfil' | 'agenda' | 'portada' | 'logo' | 'qr_pago' | 'vitrina' | 'og';

/** Respuesta de `POST /uploads` (multipart: `archivo` y `tipo`) */
export interface UploadResponse {
	/** URL pública de la imagen ya procesada */
	url: string;
}
