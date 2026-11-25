import type { Timestamps } from './common.interface';

/** Enum `ClaveSeccion`: las 8 secciones que el backend crea con cada tarjeta */
export type SeccionClave =
	| 'acerca'
	| 'contacto'
	| 'vitrina'
	| 'ubicacion'
	| 'redes'
	| 'educacion'
	| 'certificaciones'
	| 'faq';

/** `TarjetaSeccionPublic`: solo las visibles, en su orden */
export interface TarjetaSeccionPublica {
	clave: SeccionClave;
	/** null = el título por defecto de la sección (`SECCIONES_TARJETA`) */
	titulo: string | null;
}

/** `TarjetaSeccionResponse` */
export interface TarjetaSeccion extends TarjetaSeccionPublica, Timestamps {
	id: string;
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaSeccionNestedItem`: las 8 ya existen, por eso el id es obligatorio y no se envía la clave */
export interface TarjetaSeccionNestedItem {
	id: string;
	titulo?: string | null;
	is_visible?: boolean;
	orden?: number;
}
