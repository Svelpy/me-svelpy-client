import { SECCIONES_TARJETA } from '#lib/config/seccionesTarjeta.config.ts';
import type {
	ContactoTipo,
	Tarjeta,
	TarjetaCompleta,
	TarjetaContactoPublico,
	TarjetaPublica,
	TarjetaResumen,
	TarjetaSeccionPublica,
	TarjetaSocialPublica
} from '#lib/interfaces/index.ts';
import { REDES_AGENDA } from '#lib/constants/data.ts';

/** Ayudas para leer una tarjeta: nombre, contactos principales, secciones y su forma pública */

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

/** Solo lo visible, en su orden: lo que muestra la tarjeta publicada */
function visiblesEnOrden<T extends { orden: number; is_visible: boolean }>(lista: T[]): T[] {
	return ordenar(lista.filter((elemento) => elemento.is_visible));
}

/** Contactos de un tipo (de una tarjeta pública: ya visibles y en orden), el principal primero */
export function contactosDeTipo<T extends TarjetaContactoPublico>(
	contactos: T[],
	tipo: ContactoTipo
): T[] {
	return contactos
		.filter((c) => c.tipo === tipo)
		.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
}

export function contactoPrincipal<T extends TarjetaContactoPublico>(
	contactos: T[],
	tipo: ContactoTipo
): T | undefined {
	return contactosDeTipo(contactos, tipo)[0];
}

/** El teléfono con WhatsApp que se usa para consultas y el botón flotante */
export function whatsappPrincipal<T extends TarjetaContactoPublico>(contactos: T[]): T | undefined {
	return contactosDeTipo(contactos, 'phone').find((c) => c.is_wpp);
}

/** Primer enlace para agendar citas (Calendly, Doctoralia) */
export function enlaceAgenda<T extends TarjetaSocialPublica>(redes: T[]): T | undefined {
	return redes.find((r) => REDES_AGENDA.includes(r.red));
}

/** Título que se muestra: el propio de la tarjeta o el de la sección por defecto */
export function tituloSeccion(seccion: TarjetaSeccionPublica): string {
	return seccion.titulo?.trim() || SECCIONES_TARJETA[seccion.clave].titulo;
}

/** Número de un decimal que llega como texto ("250.00"); null si no hay o no es válido */
export function numeroDe(valor: string | number | null | undefined): number | null {
	if (valor === null || valor === undefined || valor === '') return null;
	const numero = typeof valor === 'number' ? valor : Number(valor);
	return Number.isFinite(numero) ? numero : null;
}

/** "Bs 3.100", "US$ 285.000": decimales solo si hacen falta */
export function formatearPrecio(valor: number | string, moneda: string): string {
	const numero = numeroDe(valor) ?? 0;
	try {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: moneda,
			minimumFractionDigits: Number.isInteger(numero) ? 0 : 2,
			maximumFractionDigits: 2
		}).format(numero);
	} catch {
		return `${moneda} ${numero}`;
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

/** Resumen de una tarjeta (lo que guarda la sesión para el header) */
export function resumenDeTarjeta(tarjeta: Tarjeta): TarjetaResumen {
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

/**
 * La tarjeta como la vería un visitante (`TarjetaPublic`): solo lo visible, en su orden, sin
 * precios si la vitrina los oculta y sin los ítems de una categoría oculta. Es la vista previa del
 * editor: lo que se ve en el espejo es exactamente lo que se publica.
 */
export function aPublica(tarjeta: TarjetaCompleta): TarjetaPublica {
	const { vitrina } = tarjeta;
	const categoriasOcultas = new Set(
		vitrina.categorias.filter((c) => !c.is_visible).map((c) => c.id)
	);
	const mostrarPrecios = vitrina.mostrar_precios;

	return {
		id: tarjeta.id,
		slug: tarjeta.slug,
		rubro: tarjeta.rubro,
		prefijo: tarjeta.prefijo,
		nombres: tarjeta.nombres,
		apellidos: tarjeta.apellidos,
		cargo: tarjeta.cargo,
		nombre_empresa: tarjeta.nombre_empresa,
		acerca_de_mi: tarjeta.acerca_de_mi,
		profile_url: tarjeta.profile_url,
		photo_usuario_url: tarjeta.photo_usuario_url,
		logo_empresa_url: tarjeta.logo_empresa_url,
		nombre_empresa_posicion: tarjeta.nombre_empresa_posicion,
		cover_url: tarjeta.cover_url,
		qr_pago_url: tarjeta.qr_pago_url,
		theme: tarjeta.theme,
		seo: tarjeta.seo,
		secciones: visiblesEnOrden(tarjeta.secciones).map(({ clave, titulo }) => ({ clave, titulo })),
		contactos: visiblesEnOrden(tarjeta.contactos),
		ubicaciones: visiblesEnOrden(tarjeta.ubicaciones),
		redes: visiblesEnOrden(tarjeta.redes),
		educaciones: visiblesEnOrden(tarjeta.educaciones),
		certificaciones: visiblesEnOrden(tarjeta.certificaciones),
		faqs: visiblesEnOrden(tarjeta.faqs),
		vitrina: {
			mostrar_precios: vitrina.mostrar_precios,
			moneda: vitrina.moneda,
			campo1_nombre: vitrina.campo1_nombre,
			campo2_nombre: vitrina.campo2_nombre,
			campo3_nombre: vitrina.campo3_nombre,
			campo4_nombre: vitrina.campo4_nombre,
			categorias: visiblesEnOrden(vitrina.categorias).map(({ id, nombre }) => ({ id, nombre })),
			items: visiblesEnOrden(vitrina.items)
				.filter((item) => !item.categoria_id || !categoriasOcultas.has(item.categoria_id))
				.map((item) => ({
					...item,
					precio: mostrarPrecios ? item.precio : null,
					precio_anterior: mostrarPrecios ? item.precio_anterior : null,
					precio_etiqueta: mostrarPrecios ? item.precio_etiqueta : null,
					imagenes: ordenar(item.imagenes)
				}))
		}
	};
}
