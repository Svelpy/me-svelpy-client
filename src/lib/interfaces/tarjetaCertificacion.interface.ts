import type { Timestamps } from './common.interface';

export interface TarjetaCertificacion extends Timestamps {
	id: string;
	tarjeta_id: string;
	nombre: string;
	entidad_emisora: string | null;
	codigo_credencial: string | null;
	/** Enlace de verificación (https) */
	url_credencial: string | null;
	/** YYYY-MM-DD */
	fecha_emision: string | null;
	/** YYYY-MM-DD, mayor o igual a la emisión; null si `no_expira` */
	fecha_expiracion: string | null;
	no_expira: boolean;
	descripcion: string | null;
	is_visible: boolean;
	orden: number;
}

/** `POST /tarjetas/{id}/certificaciones` */
export interface TarjetaCertificacionCreateRequest {
	nombre: string;
	entidad_emisora?: string | null;
	codigo_credencial?: string | null;
	url_credencial?: string | null;
	fecha_emision?: string | null;
	fecha_expiracion?: string | null;
	no_expira?: boolean;
	descripcion?: string | null;
	is_visible?: boolean;
}

/** `PATCH /certificaciones/{id}` */
export type TarjetaCertificacionUpdateRequest = Partial<TarjetaCertificacionCreateRequest>;
