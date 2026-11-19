import { SECCIONES_TARJETA } from '#lib/config/seccionesTarjeta.config.ts';
import type {
	ContactoTipo,
	TarjetaContacto,
	TarjetaSeccion,
	TarjetaSocial
} from '#lib/interfaces/index.ts';
import { REDES_AGENDA } from '#lib/constants/data.ts';

/** Ayudas para leer una tarjeta: nombre, contactos principales y secciones */

export interface NombreTarjeta {
	prefijo?: string | null;
	nombres: string;
	apellidos?: string | null;
}

/** "Dra. Fabiola Mendoza Rojas" */
export function nombreCompleto(tarjeta: NombreTarjeta): string {
	return [tarjeta.prefijo, tarjeta.nombres, tarjeta.apellidos].filter(Boolean).join(' ').trim();
}

/** "Fabiola Mendoza Rojas" */
export function nombreSinPrefijo(tarjeta: NombreTarjeta): string {
	return [tarjeta.nombres, tarjeta.apellidos].filter(Boolean).join(' ').trim();
}

/** Iniciales para un avatar sin foto: "FM" */
export function iniciales(origen: NombreTarjeta | string): string {
	const texto = typeof origen === 'string' ? origen : nombreSinPrefijo(origen);
	const palabras = texto.split(/[\s@._-]+/).filter(Boolean);
	return palabras
		.slice(0, 2)
		.map((palabra) => palabra.charAt(0))
		.join('')
		.toUpperCase();
}

/** Lista ordenada por `orden` (copia) */
export function ordenar<T extends { orden: number }>(lista: T[]): T[] {
	return [...lista].sort((a, b) => a.orden - b.orden);
}

/** Contactos visibles de un tipo: el principal primero y luego en su orden */
export function contactosDeTipo(
	contactos: TarjetaContacto[],
	tipo: ContactoTipo
): TarjetaContacto[] {
	return ordenar(contactos.filter((c) => c.tipo === tipo && c.is_visible)).sort(
		(a, b) => Number(b.is_primary) - Number(a.is_primary)
	);
}

export function contactoPrincipal(
	contactos: TarjetaContacto[],
	tipo: ContactoTipo
): TarjetaContacto | undefined {
	return contactosDeTipo(contactos, tipo)[0];
}

/** El teléfono con WhatsApp que se usa para consultas y el botón flotante */
export function whatsappPrincipal(contactos: TarjetaContacto[]): TarjetaContacto | undefined {
	return contactosDeTipo(contactos, 'phone').find((c) => c.is_wpp);
}

/** Primer enlace visible para agendar citas (Calendly, Doctoralia) */
export function enlaceAgenda(sociales: TarjetaSocial[]): TarjetaSocial | undefined {
	return ordenar(sociales).find((s) => s.is_visible && REDES_AGENDA.includes(s.red));
}

/** Secciones visibles en el orden en que se muestran */
export function seccionesVisibles<T extends Pick<TarjetaSeccion, 'is_visible' | 'orden'>>(
	secciones: T[]
): T[] {
	return ordenar(secciones.filter((s) => s.is_visible));
}

/** Título que se muestra: el propio de la tarjeta o el de la sección por defecto */
export function tituloSeccion(seccion: Pick<TarjetaSeccion, 'clave' | 'titulo'>): string {
	return seccion.titulo?.trim() || SECCIONES_TARJETA[seccion.clave].titulo;
}

/** "Bs 3.100", "US$ 285.000": decimales solo si hacen falta */
export function formatearPrecio(valor: number, moneda: string): string {
	try {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: moneda,
			minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
			maximumFractionDigits: 2
		}).format(valor);
	} catch {
		return `${moneda} ${valor}`;
	}
}

/** Año de una fecha YYYY-MM-DD */
export function anioDe(fecha: string | null): string | null {
	return fecha ? fecha.slice(0, 4) : null;
}

/** "mayo de 2016" (sin correr el día por la zona horaria) */
export function mesYAnio(fecha: string): string {
	const [anio, mes] = fecha.split('-').map(Number);
	return new Date(anio, mes - 1, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

/** Resumen de una tarjeta completa (lo que guarda la sesión para el header) */
export function resumenDeTarjeta(tarjeta: {
	id: string;
	slug: string;
	prefijo: string | null;
	nombres: string;
	apellidos: string | null;
	cargo: string | null;
	rubro: string;
	profile_url: string | null;
	is_public: boolean;
	published_at: string | null;
	updated_at: string;
}) {
	const {
		id,
		slug,
		prefijo,
		nombres,
		apellidos,
		cargo,
		rubro,
		profile_url,
		is_public,
		published_at,
		updated_at
	} = tarjeta;
	return {
		id,
		slug,
		prefijo,
		nombres,
		apellidos,
		cargo,
		rubro,
		profile_url,
		is_public,
		published_at,
		updated_at
	};
}
