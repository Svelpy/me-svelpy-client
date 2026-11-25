import type { Timestamps } from './common.interface';

/** Enum `RedSocial` de la API */
export type RedSocial =
	| 'facebook'
	| 'instagram'
	| 'tiktok'
	| 'x'
	| 'threads'
	| 'bluesky'
	| 'pinterest'
	| 'linkedin'
	| 'youtube'
	| 'twitch'
	| 'vimeo'
	| 'spotify'
	| 'soundcloud'
	| 'medium'
	| 'substack'
	| 'github'
	| 'gitlab'
	| 'behance'
	| 'dribbble'
	| 'telegram'
	| 'discord'
	| 'calendly'
	| 'doctoralia'
	| 'otro';

/** `TarjetaSocialPublic` */
export interface TarjetaSocialPublica {
	id: string;
	red: RedSocial;
	/** https */
	url: string;
	username: string | null;
}

/** `TarjetaSocialResponse` */
export interface TarjetaSocial extends TarjetaSocialPublica, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaSocialCreate` */
export interface TarjetaSocialInput {
	red: RedSocial;
	url: string;
	username?: string | null;
	is_visible?: boolean;
	orden?: number;
}

/** `TarjetaSocialNestedItem` */
export interface TarjetaSocialNestedItem extends TarjetaSocialInput {
	id?: string | null;
}
