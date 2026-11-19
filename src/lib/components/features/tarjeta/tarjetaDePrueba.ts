/**
 * Tarjeta mínima y completa en tipos para las pruebas de componentes (no depende de los datos de
 * prueba de `src/lib/mocks`, así que sobrevive al pasar a la API real).
 */
import { SECCIONES_ORDEN_POR_DEFECTO } from '#lib/config/seccionesTarjeta.config.ts';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import type { SeccionClave, TarjetaListItem, TarjetaPublica } from '#lib/interfaces/index.ts';

const FECHA = '2026-01-15T12:00:00.000Z';
const fechas = { created_at: FECHA, updated_at: FECHA };

export function tarjetaDePrueba(cambios: Partial<TarjetaPublica> = {}): TarjetaPublica {
	const id = 'tarjeta-1';
	return {
		id,
		slug: 'doctora-prueba',
		rubro: 'Pediatría',
		prefijo: 'Dra.',
		nombres: 'Lucía',
		apellidos: 'Prueba',
		cargo: 'Pediatra',
		nombre_empresa: null,
		acerca_de_mi: 'Atiendo a niños y adolescentes en Santa Cruz.',
		profile_url: null,
		photo_usuario_url: null,
		logo_empresa_url: null,
		nombre_empresa_posicion: 'oculto',
		cover_url: null,
		qr_tarjeta_url: null,
		qr_pago_url: null,
		is_public: true,
		published_at: FECHA,
		...fechas,
		theme: {
			id: 'tema-1',
			tarjeta_id: id,
			preset: 'salud',
			tipografia: 1,
			...TEMAS_TARJETA.salud.colores,
			...fechas
		},
		seo: {
			id: 'seo-1',
			tarjeta_id: id,
			meta_title: null,
			meta_description: null,
			og_image_url: null,
			robots_index: true,
			...fechas
		},
		secciones: SECCIONES_ORDEN_POR_DEFECTO.map((clave: SeccionClave, orden) => ({
			id: `seccion-${clave}`,
			tarjeta_id: id,
			clave,
			titulo: null,
			is_visible: true,
			orden,
			...fechas
		})),
		contactos: [
			{
				id: 'contacto-1',
				tarjeta_id: id,
				tipo: 'phone',
				valor: '+591 70000000',
				etiqueta: 'Consultas',
				is_wpp: true,
				is_primary: true,
				is_visible: true,
				orden: 0,
				...fechas
			}
		],
		ubicaciones: [],
		sociales: [],
		vitrina: {
			id: 'vitrina-1',
			tarjeta_id: id,
			mostrar_precios: true,
			moneda: 'BOB',
			campo1_nombre: null,
			campo2_nombre: null,
			campo3_nombre: null,
			campo4_nombre: null,
			categorias: [],
			items: [],
			...fechas
		},
		educacion: [],
		certificaciones: [],
		faq: [
			{
				id: 'faq-1',
				tarjeta_id: id,
				pregunta: '¿Atiendes urgencias?',
				respuesta: 'Sí, de lunes a sábado.',
				is_visible: true,
				orden: 0,
				...fechas
			}
		],
		...cambios
	};
}

/** La misma tarjeta como la lista el directorio del panel */
export function tarjetaListItemDePrueba(cambios: Partial<TarjetaListItem> = {}): TarjetaListItem {
	const tarjeta = tarjetaDePrueba();
	return {
		id: tarjeta.id,
		slug: tarjeta.slug,
		prefijo: tarjeta.prefijo,
		nombres: tarjeta.nombres,
		apellidos: tarjeta.apellidos,
		cargo: tarjeta.cargo,
		rubro: tarjeta.rubro,
		profile_url: null,
		is_public: tarjeta.is_public,
		published_at: tarjeta.published_at,
		updated_at: FECHA,
		created_at: FECHA,
		nombre_empresa: null,
		cover_url: null,
		tema: {
			color_fondo: tarjeta.theme.color_fondo,
			color_superficie: tarjeta.theme.color_superficie,
			color_borde: tarjeta.theme.color_borde,
			color_titulo: tarjeta.theme.color_titulo,
			color_texto_secundario: tarjeta.theme.color_texto_secundario,
			color_primario: tarjeta.theme.color_primario,
			color_texto_sobre_primario: tarjeta.theme.color_texto_sobre_primario,
			color_overlay_portada: tarjeta.theme.color_overlay_portada,
			overlay_opacidad: tarjeta.theme.overlay_opacidad,
			tipografia: tarjeta.theme.tipografia
		},
		propietario: { id: 'usuario-1', email: 'lucia@prueba.test', is_active: true },
		...cambios
	};
}
