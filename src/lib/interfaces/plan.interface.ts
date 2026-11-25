import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';

/** `PlanResponse`: filas fijas del catálogo (free, pro…) */
export interface Plan extends Timestamps {
	id: string;
	/** Identificador estable (`free`, `pro`); no se edita */
	codigo: string;
	nombre: string;
	/** Decimal como texto ("80.00") */
	precio: string;
	/** ISO 4217 */
	moneda: string;
	duracion_dias: number;
	/** Se muestra en la página de precios */
	is_visible: boolean;
}

/** `GET /planes/public` (`PlanPublic`) */
export type PlanPublico = Pick<
	Plan,
	'id' | 'codigo' | 'nombre' | 'precio' | 'moneda' | 'duracion_dias'
>;

/** `PlanRef` */
export interface PlanRef {
	id: string;
	nombre: string;
}

/** `PATCH /planes/{id}` (`PlanUpdate`): todo menos el código */
export interface PlanUpdateRequest {
	nombre?: string;
	precio?: number | string;
	moneda?: string;
	duracion_dias?: number;
	is_visible?: boolean;
}

/** Filtros de `GET /planes/` */
export interface PlanFiltros extends PaginationParams {
	is_visible?: boolean;
}
