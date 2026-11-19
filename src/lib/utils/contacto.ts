import { CODIGO_PAIS_POR_DEFECTO } from '#lib/constants/data.ts';
import type { RedSocial, TarjetaContacto, TarjetaUbicacion } from '#lib/interfaces/index.ts';

/** Enlaces de contacto (WhatsApp, teléfono, correo, mapas) a partir de los datos de la tarjeta */

export function soloDigitos(valor: string): string {
	return valor.replace(/\D/g, '');
}

/**
 * Número en formato internacional, solo dígitos (para wa.me y tel:). A los números locales
 * (sin "+" ni código de país) se les antepone el código del país (Bolivia por defecto).
 */
export function numeroInternacional(valor: string, codigoPais = CODIGO_PAIS_POR_DEFECTO): string {
	const texto = valor.trim();
	const digitos = soloDigitos(texto);
	if (texto.startsWith('+')) return digitos;
	if (texto.startsWith('00')) return digitos.slice(2);
	if (digitos.startsWith(codigoPais) && digitos.length > 8) return digitos;
	return `${codigoPais}${digitos}`;
}

export function whatsappUrl(numero: string, mensaje?: string): string {
	const base = `https://wa.me/${numeroInternacional(numero)}`;
	return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export function telUrl(numero: string): string {
	return `tel:+${numeroInternacional(numero)}`;
}

export function mailtoUrl(email: string, asunto?: string): string {
	return asunto ? `mailto:${email}?subject=${encodeURIComponent(asunto)}` : `mailto:${email}`;
}

/** Agrega https:// si el usuario escribió el sitio sin protocolo */
export function websiteUrl(valor: string): string {
	return /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
}

/** URL legible: sin protocolo, sin "www." y sin barra final */
export function urlSinProtocolo(url: string): string {
	return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

/** Enlace que abre cada tipo de contacto */
export function hrefContacto(contacto: Pick<TarjetaContacto, 'tipo' | 'valor'>): string {
	switch (contacto.tipo) {
		case 'phone':
			return telUrl(contacto.valor);
		case 'email':
			return mailtoUrl(contacto.valor);
		case 'website':
			return websiteUrl(contacto.valor);
	}
}

type UbicacionMapa = Pick<
	TarjetaUbicacion,
	'maps_url' | 'lat' | 'lng' | 'direccion' | 'ciudad' | 'departamento' | 'pais'
>;

function direccionCompleta(ubicacion: UbicacionMapa): string {
	return [ubicacion.direccion, ubicacion.ciudad, ubicacion.departamento, ubicacion.pais]
		.filter(Boolean)
		.join(', ');
}

/** Ficha en Google Maps: la del profesional, o una búsqueda por coordenadas o dirección */
export function mapsUrl(ubicacion: UbicacionMapa): string {
	if (ubicacion.maps_url) return ubicacion.maps_url;
	const consulta =
		ubicacion.lat !== null && ubicacion.lng !== null
			? `${ubicacion.lat},${ubicacion.lng}`
			: direccionCompleta(ubicacion);
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

/** Ruta en Google Maps desde donde está el visitante */
export function comoLlegarUrl(ubicacion: UbicacionMapa): string {
	const destino =
		ubicacion.lat !== null && ubicacion.lng !== null
			? `${ubicacion.lat},${ubicacion.lng}`
			: direccionCompleta(ubicacion);
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
}

/** Dominios de cada red, para reconocerla al pegar un enlace */
const DOMINIOS_RED: [RedSocial, RegExp][] = [
	['instagram', /(^|\.)instagram\.com$/],
	['facebook', /(^|\.)(facebook\.com|fb\.com|fb\.me)$/],
	['tiktok', /(^|\.)tiktok\.com$/],
	['linkedin', /(^|\.)linkedin\.com$/],
	['youtube', /(^|\.)(youtube\.com|youtu\.be)$/],
	['x', /(^|\.)(x\.com|twitter\.com)$/],
	['threads', /(^|\.)threads\.(net|com)$/],
	['bluesky', /(^|\.)bsky\.app$/],
	['pinterest', /(^|\.)pinterest\.[a-z.]+$/],
	['twitch', /(^|\.)twitch\.tv$/],
	['vimeo', /(^|\.)vimeo\.com$/],
	['spotify', /(^|\.)spotify\.com$/],
	['soundcloud', /(^|\.)soundcloud\.com$/],
	['medium', /(^|\.)medium\.com$/],
	['substack', /(^|\.)substack\.com$/],
	['github', /(^|\.)github\.com$/],
	['gitlab', /(^|\.)gitlab\.com$/],
	['behance', /(^|\.)behance\.net$/],
	['dribbble', /(^|\.)dribbble\.com$/],
	['telegram', /(^|\.)(t\.me|telegram\.me)$/],
	['discord', /(^|\.)(discord\.gg|discord\.com)$/],
	['calendly', /(^|\.)calendly\.com$/],
	['doctoralia', /(^|\.)doctoralia\.[a-z.]+$/]
];

/** Red social de un enlace pegado; null si no se reconoce o no es una URL */
export function detectarRedSocial(url: string): RedSocial | null {
	try {
		const host = new URL(websiteUrl(url.trim())).hostname.toLowerCase();
		return DOMINIOS_RED.find(([, dominio]) => dominio.test(host))?.[0] ?? null;
	} catch {
		return null;
	}
}

/** Usuario de un enlace de red (`instagram.com/dra.fabiola` → `dra.fabiola`); null si no hay */
export function usuarioDesdeUrl(url: string): string | null {
	try {
		const { pathname } = new URL(websiteUrl(url.trim()));
		const primero = pathname.split('/').filter(Boolean)[0];
		if (!primero || ['in', 'company', 'channel', 'user', 'c', 'p', 'pages'].includes(primero)) {
			const segundo = pathname.split('/').filter(Boolean)[1];
			return segundo ? decodeURIComponent(segundo).replace(/^@/, '') : null;
		}
		return decodeURIComponent(primero).replace(/^@/, '');
	} catch {
		return null;
	}
}
