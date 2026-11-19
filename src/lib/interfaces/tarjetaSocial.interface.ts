import type { Timestamps } from './common.interface';

/** Enum `red_social` de la base de datos */
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

export interface TarjetaSocial extends Timestamps {
	id: string;
	tarjeta_id: string;
	red: RedSocial;
	/** https */
	url: string;
	username: string | null;
	is_visible: boolean;
	orden: number;
}

/** `POST /tarjetas/{id}/redes` */
export interface TarjetaSocialCreateRequest {
	red: RedSocial;
	url: string;
	username?: string | null;
	is_visible?: boolean;
}

/** `PATCH /redes/{id}` */
export type TarjetaSocialUpdateRequest = Partial<TarjetaSocialCreateRequest>;
