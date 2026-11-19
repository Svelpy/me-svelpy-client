import type { Timestamps } from './common.interface';

export interface TarjetaEducacion extends Timestamps {
	id: string;
	tarjeta_id: string;
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
	is_visible: boolean;
	orden: number;
}

/** `POST /tarjetas/{id}/educacion` */
export interface TarjetaEducacionCreateRequest {
	institucion: string;
	titulo?: string | null;
	area_estudio?: string | null;
	descripcion?: string | null;
	fecha_inicio?: string | null;
	fecha_fin?: string | null;
	is_actual?: boolean;
	is_visible?: boolean;
}

/** `PATCH /educacion/{id}` */
export type TarjetaEducacionUpdateRequest = Partial<TarjetaEducacionCreateRequest>;
