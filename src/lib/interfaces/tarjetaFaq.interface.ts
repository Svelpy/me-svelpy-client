import type { Timestamps } from './common.interface';

export interface TarjetaFaq extends Timestamps {
	id: string;
	tarjeta_id: string;
	pregunta: string;
	respuesta: string;
	is_visible: boolean;
	orden: number;
}

/** `POST /tarjetas/{id}/faq` */
export interface TarjetaFaqCreateRequest {
	pregunta: string;
	respuesta: string;
	is_visible?: boolean;
}

/** `PATCH /faq/{id}` */
export type TarjetaFaqUpdateRequest = Partial<TarjetaFaqCreateRequest>;
