import type { Timestamps } from './common.interface';

/** SEO propio de cada tarjeta (`tarjeta_seo`). Lo que queda en null se genera desde la tarjeta. */
export interface TarjetaSeo extends Timestamps {
	id: string;
	tarjeta_id: string;
	/** Máximo 70 caracteres; null = nombre y cargo */
	meta_title: string | null;
	/** Máximo 160 caracteres; null = se arma con cargo, empresa, ciudad y "acerca de mí" */
	meta_description: string | null;
	/** null = `profile_url` */
	og_image_url: string | null;
	/** false = noindex (no aparece en Google) */
	robots_index: boolean;
}

/** `PUT /tarjetas/{id}/seo` */
export interface TarjetaSeoUpdateRequest {
	meta_title: string | null;
	meta_description: string | null;
	og_image_url: string | null;
	robots_index: boolean;
}
