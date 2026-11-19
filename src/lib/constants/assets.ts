export const APP_SITE_CONFIG = {
	APP_NAME: 'ME',
	/** Solo para el logo y el sello de las tarjetas */
	APP_FULL_NAME: 'ME by Svelpy',
	APP_DESCRIPTION: 'Tarjetas digitales profesionales con SEO y GEO.',
	/** Imagen Open Graph por defecto (1200x630) */
	DEFAULT_OG_IMAGE: '/images/landing/og-me-by-svelpy.png',
	/** Vacío = no se publica twitter:site */
	APP_TWITTER_HANDLE: '',
	/** WhatsApp de soporte (+591 76727537): solo dígitos, con código de país */
	SOPORTE_WHATSAPP: '59176727537'
} as const;

/** Logos de ME en static/images/landing. "claro" = para fondos claros (ciruela y naranja) */
export const LOGOS_ME = {
	isotipoClaro: '/images/landing/me-isotipo-claro.svg',
	isotipoOscuro: '/images/landing/me-isotipo-oscuro.svg',
	completoClaro: '/images/landing/me-by-svelpy-claro.svg',
	completoOscuro: '/images/landing/me-by-svelpy-oscuro.svg'
} as const;
