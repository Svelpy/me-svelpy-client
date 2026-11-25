/**
 * Tarjeta mínima y completa en tipos para las pruebas de componentes. Sigue la forma de la API
 * (`TarjetaResponseMe` y `TarjetaPublic`); no se usa fuera de los tests.
 */
import { SECCIONES_ORDEN_POR_DEFECTO } from '#lib/config/seccionesTarjeta.config.ts';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import type {
	Plan,
	TarjetaCompleta,
	TarjetaListItem,
	TarjetaPublica,
	UsuarioDetalle
} from '#lib/interfaces/index.ts';
import { aPublica } from '#lib/utils/tarjeta.ts';

const FECHA = '2026-01-15T12:00:00.000Z';
const fechas = { created_at: FECHA, updated_at: FECHA };
const ID = 'tarjeta-1';

/** La tarjeta como la ve su dueño (todas las filas, con theme, SEO y vitrina) */
export function tarjetaCompletaDePrueba(cambios: Partial<TarjetaCompleta> = {}): TarjetaCompleta {
	return {
		id: ID,
		user_id: 'usuario-1',
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
		qr_pago_url: null,
		is_public: true,
		published_at: FECHA,
		...fechas,
		theme: {
			id: ID,
			preset: 'salud',
			tipografia: 1,
			...TEMAS_TARJETA.salud.colores,
			...fechas
		},
		seo: {
			id: ID,
			meta_title: null,
			meta_description: null,
			og_image_url: null,
			robots_index: true,
			...fechas
		},
		secciones: SECCIONES_ORDEN_POR_DEFECTO.map((clave, orden) => ({
			id: `seccion-${clave}`,
			tarjeta_id: ID,
			clave,
			titulo: null,
			is_visible: true,
			orden,
			...fechas
		})),
		contactos: [
			{
				id: 'contacto-1',
				tarjeta_id: ID,
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
		redes: [],
		vitrina: {
			id: ID,
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
		educaciones: [],
		certificaciones: [],
		faqs: [
			{
				id: 'faq-1',
				tarjeta_id: ID,
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

/** La misma tarjeta como la ve un visitante (`TarjetaPublic`) */
export function tarjetaDePrueba(cambios: Partial<TarjetaPublica> = {}): TarjetaPublica {
	return { ...aPublica(tarjetaCompletaDePrueba()), ...cambios };
}

/** La misma tarjeta como la lista el directorio del panel */
export function tarjetaListItemDePrueba(cambios: Partial<TarjetaListItem> = {}): TarjetaListItem {
	const {
		theme: _theme,
		seo: _seo,
		vitrina: _vitrina,
		secciones: _secciones,
		contactos: _contactos,
		ubicaciones: _ubicaciones,
		redes: _redes,
		educaciones: _educaciones,
		certificaciones: _certificaciones,
		faqs: _faqs,
		...tarjeta
	} = tarjetaCompletaDePrueba();
	return { ...tarjeta, user: { id: 'usuario-1', email: 'lucia@prueba.test' }, ...cambios };
}

/** Plan del catálogo */
export function planDePrueba(cambios: Partial<Plan> = {}): Plan {
	return {
		id: 'plan-pro',
		codigo: 'pro',
		nombre: 'Pro',
		precio: '80.00',
		moneda: 'USD',
		duracion_dias: 365,
		is_visible: true,
		...fechas,
		...cambios
	};
}

/** Cuenta dueña de la tarjeta, con Pro vigente y el email verificado */
export function cuentaDePrueba(cambios: Partial<UsuarioDetalle> = {}): UsuarioDetalle {
	return {
		id: 'usuario-1',
		email: 'lucia@prueba.test',
		rol: 'user',
		plan_id: 'plan-pro',
		plan_vence_at: '2099-01-01T00:00:00.000Z',
		is_active: true,
		email_verified_at: FECHA,
		...fechas,
		plan: planDePrueba(),
		...cambios
	};
}
