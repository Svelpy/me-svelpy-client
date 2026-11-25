import type { Timestamps } from './common.interface';

/** `TarjetaSeoPublic`. Lo que queda en null lo genera el frontend desde la tarjeta */
export interface TarjetaSeoPublico {
	/** Máximo 70 caracteres; null = nombre y cargo */
	meta_title: string | null;
	/** Máximo 160 caracteres; null = se arma con cargo, empresa, ciudad y "acerca de mí" */
	meta_description: string | null;
	/** null = `profile_url` */
	og_image_url: string | null;
	/** false = noindex (no aparece en Google) */
	robots_index: boolean;
}

/** `TarjetaSeoResponse`. Su id es el de la tarjeta */
export interface TarjetaSeo extends TarjetaSeoPublico, Timestamps {
	id: string;
}

/** `PATCH /tarjeta-seos/{id}` (`TarjetaSeoUpdate`) y `TarjetaSeoCreate`: lo que no se envía no cambia */
export type TarjetaSeoUpdateRequest = Partial<TarjetaSeoPublico>;
