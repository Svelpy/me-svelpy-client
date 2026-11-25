import type { Timestamps } from './common.interface';

/** `TarjetaFaqPublic` */
export interface TarjetaFaqPublica {
	id: string;
	pregunta: string;
	respuesta: string;
}

/** `TarjetaFaqResponse` */
export interface TarjetaFaq extends TarjetaFaqPublica, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaFaqCreate` */
export interface TarjetaFaqInput {
	pregunta: string;
	respuesta: string;
	is_visible?: boolean;
	orden?: number;
}

/** `TarjetaFaqNestedItem` */
export interface TarjetaFaqNestedItem extends TarjetaFaqInput {
	id?: string | null;
}
