import type { Timestamps } from './common.interface';

/** `TarjetaEducacionPublic` */
export interface TarjetaEducacionPublica {
	id: string;
	institucion: string;
	titulo: string | null;
	area_estudio: string | null;
	descripcion: string | null;
	/** YYYY-MM-DD */
	fecha_inicio: string | null;
	/** YYYY-MM-DD, mayor o igual a `fecha_inicio`; null si `is_actual` */
	fecha_fin: string | null;
	/** Lo sigue cursando */
	is_actual: boolean;
}

/** `TarjetaEducacionResponse` */
export interface TarjetaEducacion extends TarjetaEducacionPublica, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaEducacionCreate` */
export interface TarjetaEducacionInput {
	institucion: string;
	titulo?: string | null;
	area_estudio?: string | null;
	descripcion?: string | null;
	fecha_inicio?: string | null;
	fecha_fin?: string | null;
	is_actual?: boolean;
	is_visible?: boolean;
	orden?: number;
}

/** `TarjetaEducacionNestedItem` */
export interface TarjetaEducacionNestedItem extends TarjetaEducacionInput {
	id?: string | null;
}
