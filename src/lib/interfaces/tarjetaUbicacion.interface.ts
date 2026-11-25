import type { Timestamps } from './common.interface';

/** 1 = lunes … 7 = domingo */
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** `UbicacionHorarioPublic`. Horas HH:MM de 24 horas; no cruza la medianoche */
export interface UbicacionHorarioPublico {
	dia_semana: DiaSemana;
	hora_inicio: string;
	/** Mayor que `hora_inicio` */
	hora_fin: string;
}

/** `UbicacionHorarioResponse` */
export interface UbicacionHorario extends UbicacionHorarioPublico, Timestamps {
	id: string;
	ubicacion_id: string;
}

/** `UbicacionHorarioCreate` */
export type UbicacionHorarioInput = UbicacionHorarioPublico;

/** `UbicacionHorarioNestedItem` */
export interface UbicacionHorarioNestedItem extends UbicacionHorarioInput {
	id?: string | null;
}

/** `TarjetaUbicacionPublic` */
export interface TarjetaUbicacionPublica {
	id: string;
	/** Consultorio Norte, Oficina central… */
	nombre: string | null;
	direccion: string;
	ciudad: string | null;
	departamento: string | null;
	pais: string | null;
	/** Ficha de Google Maps */
	maps_url: string | null;
	/** Decimal como texto ("-16.509710"); va junto con `lng` */
	lat: string | null;
	lng: string | null;
	/** Ordenados por día y hora de inicio */
	horarios: UbicacionHorarioPublico[];
}

/** `TarjetaUbicacionResponseDetail` */
export interface TarjetaUbicacion extends Omit<TarjetaUbicacionPublica, 'horarios'>, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
	horarios: UbicacionHorario[];
}

/** `TarjetaUbicacionCreateNested` */
export interface TarjetaUbicacionInput {
	nombre?: string | null;
	direccion: string;
	ciudad?: string | null;
	departamento?: string | null;
	pais?: string | null;
	maps_url?: string | null;
	/** -90 a 90 */
	lat?: number | string | null;
	/** -180 a 180 */
	lng?: number | string | null;
	is_visible?: boolean;
	orden?: number;
	/** Máximo 21 */
	horarios?: UbicacionHorarioInput[];
}

/** `TarjetaUbicacionNestedItem`: `horarios` es el estado final; ausente o null no se toca */
export interface TarjetaUbicacionNestedItem extends Omit<TarjetaUbicacionInput, 'horarios'> {
	id?: string | null;
	horarios?: UbicacionHorarioNestedItem[] | null;
}
