import type { Timestamps } from './common.interface';

/** `TarjetaCertificacionPublic` */
export interface TarjetaCertificacionPublica {
	id: string;
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
}

/** `TarjetaCertificacionResponse` */
export interface TarjetaCertificacion extends TarjetaCertificacionPublica, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaCertificacionCreate` */
export interface TarjetaCertificacionInput {
	nombre: string;
	entidad_emisora?: string | null;
	codigo_credencial?: string | null;
	url_credencial?: string | null;
	fecha_emision?: string | null;
	fecha_expiracion?: string | null;
	no_expira?: boolean;
	descripcion?: string | null;
	is_visible?: boolean;
	orden?: number;
}

/** `TarjetaCertificacionNestedItem` */
export interface TarjetaCertificacionNestedItem extends TarjetaCertificacionInput {
	id?: string | null;
}
