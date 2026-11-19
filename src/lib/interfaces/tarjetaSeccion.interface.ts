import type { Timestamps } from './common.interface';

/** Secciones de la tarjeta pública; una fila por clave (máximo 9 por tarjeta) */
export type SeccionClave =
	| 'acerca'
	| 'contacto'
	| 'acciones'
	| 'vitrina'
	| 'ubicacion'
	| 'redes'
	| 'educacion'
	| 'certificaciones'
	| 'faq';

export interface TarjetaSeccion extends Timestamps {
	id: string;
	tarjeta_id: string;
	clave: SeccionClave;
	/** null = el título por defecto de la sección (`SECCIONES_TARJETA`) */
	titulo: string | null;
	is_visible: boolean;
	orden: number;
}

/** Sección dentro de una tarjeta nueva (`TarjetaNuevaRequest.secciones`) */
export interface TarjetaSeccionInput {
	clave: SeccionClave;
	titulo?: string | null;
	is_visible?: boolean;
	orden?: number;
}

/** `PUT /tarjetas/{id}/secciones`: las 9 secciones con su orden, visibilidad y título */
export interface TarjetaSeccionesUpdateRequest {
	secciones: {
		clave: SeccionClave;
		titulo: string | null;
		is_visible: boolean;
		orden: number;
	}[];
}

/** `PATCH /secciones/{id}` */
export interface TarjetaSeccionUpdateRequest {
	titulo?: string | null;
	is_visible?: boolean;
	orden?: number;
}
