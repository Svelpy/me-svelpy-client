/** Fechas que la API agrega a cada registro (ISO 8601) */
export interface Timestamps {
	created_at: string;
	updated_at: string;
}

/** Cuerpo para reordenar una lista (`PUT …/orden`): todos los ids, en el orden nuevo */
export interface ReordenarRequest {
	ids: string[];
}
