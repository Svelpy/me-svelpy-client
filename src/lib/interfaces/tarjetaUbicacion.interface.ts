import type { Timestamps } from './common.interface';

/** 1 = lunes … 7 = domingo */
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Franja de atención (`ubicacion_horario`). Horas en formato HH:MM de 24 horas */
export interface UbicacionHorario {
	id: string;
	ubicacion_id: string;
	dia_semana: DiaSemana;
	hora_inicio: string;
	/** Mayor que `hora_inicio` */
	hora_fin: string;
	created_at: string;
}

export interface UbicacionHorarioInput {
	dia_semana: DiaSemana;
	hora_inicio: string;
	hora_fin: string;
}

export interface TarjetaUbicacion extends Timestamps {
	id: string;
	tarjeta_id: string;
	/** Consultorio Norte, Oficina central… */
	nombre: string | null;
	direccion: string;
	ciudad: string | null;
	departamento: string | null;
	pais: string | null;
	/** Ficha de Google Maps */
	maps_url: string | null;
	/** -90 a 90; va junto con `lng` */
	lat: number | null;
	/** -180 a 180; va junto con `lat` */
	lng: number | null;
	is_visible: boolean;
	orden: number;
	/** Ordenados por día y hora de inicio */
	horarios: UbicacionHorario[];
}

/** `POST /tarjetas/{id}/ubicaciones`, con sus horarios en la misma petición */
export interface TarjetaUbicacionCreateRequest {
	nombre?: string | null;
	direccion: string;
	ciudad?: string | null;
	departamento?: string | null;
	pais?: string | null;
	maps_url?: string | null;
	lat?: number | null;
	lng?: number | null;
	is_visible?: boolean;
	horarios?: UbicacionHorarioInput[];
}

/** `PATCH /ubicaciones/{id}`. Si trae `horarios`, reemplazan a los anteriores */
export type TarjetaUbicacionUpdateRequest = Partial<TarjetaUbicacionCreateRequest>;

/** `PUT /ubicaciones/{id}/horarios`: la semana completa */
export interface UbicacionHorariosUpdateRequest {
	horarios: UbicacionHorarioInput[];
}
