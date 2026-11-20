import { z } from 'zod';
import { Module, Role } from '#lib/config/permissions.config.ts';
import { puedePublicar } from '#lib/config/planes.config.ts';
import { normalizarTexto } from '#lib/config/rubros.config.ts';
import { SLUGS_RESERVADOS } from '#lib/constants/slugs.ts';
import type {
	SlugDisponibilidad,
	Tarjeta,
	TarjetaCompleta,
	TarjetaListItem,
	TarjetaPropietario,
	TarjetaPublica,
	TarjetaResumen
} from '#lib/interfaces/index.ts';
import { canCambiarSlug } from '#lib/utils/rbac.utils.ts';
import { nombreCompleto } from '#lib/utils/tarjeta.ts';
import { slugSchema } from '#lib/zod/common.ts';
import { tarjetaEditarSchema, tarjetaNuevaSchema } from '#lib/zod/tarjeta.schema.ts';
import {
	Action,
	ahora,
	error,
	esSuperadmin,
	exigirAccesoTarjeta,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	paginar,
	rolDe,
	sinEliminado,
	validar,
	type RutaMock,
	type Sesion
} from '../db/contexto';
import { enTransaccion } from '../db/storage';
import { db, type TarjetaRow } from '../db/tablas';
import { aRespuestaCertificacion, certificacionMock } from './tarjetaCertificacion.mock';
import { aRespuestaContacto, contactoMock } from './tarjetaContacto.mock';
import { aRespuestaEducacion, educacionMock } from './tarjetaEducacion.mock';
import { aRespuestaFaq, faqMock } from './tarjetaFaq.mock';
import { aRespuestaSeccion, seccionMock } from './tarjetaSeccion.mock';
import { aRespuestaSeo, seoMock } from './tarjetaSeo.mock';
import { aRespuestaSocial, socialMock } from './tarjetaSocial.mock';
import { aRespuestaTema, temaMock } from './tarjetaTheme.mock';
import { aRespuestaUbicacion, ubicacionMock } from './tarjetaUbicacion.mock';
import { vitrinaMock } from './vitrina.mock';

/**
 * Modelo `tarjeta`: el agregado completo. Se crea con todo su contenido en una sola transacción,
 * se lee completa en una sola respuesta y se elimina (lógicamente) en cascada.
 */

function obtenerFila(id: string): TarjetaRow {
	const fila = db.tarjetas.buscar(id);
	if (!fila) throw error.noEncontrado('La tarjeta no existe.');
	return fila;
}

function deUsuario(userId: string): TarjetaRow | undefined {
	return db.tarjetas.activas().find((t) => t.user_id === userId);
}

export function resumenTarjeta(fila: TarjetaRow): TarjetaResumen {
	return {
		id: fila.id,
		slug: fila.slug,
		prefijo: fila.prefijo,
		nombres: fila.nombres,
		apellidos: fila.apellidos,
		cargo: fila.cargo,
		rubro: fila.rubro,
		profile_url: fila.profile_url,
		is_public: fila.is_public,
		published_at: fila.published_at,
		updated_at: fila.updated_at
	};
}

function propietarioDe(fila: TarjetaRow): TarjetaPropietario {
	const usuario = db.usuarios.todas().find((u) => u.id === fila.user_id);
	return {
		id: fila.user_id,
		email: usuario?.email ?? '',
		is_active: !!usuario?.is_active,
		plan: usuario?.plan ?? 'free',
		plan_vence_at: usuario?.plan_vence_at ?? null
	};
}

/** Publicar pide el plan Pro vigente del dueño de la tarjeta (no de quien hace la petición) */
function exigirPlanParaPublicar(userId: string): void {
	const dueno = db.usuarios.buscar(userId);
	if (!dueno || !puedePublicar(dueno)) throw error.planRequerido();
}

export function itemDeLista(fila: TarjetaRow): TarjetaListItem {
	const tema = temaMock.deTarjeta(fila.id);
	return {
		...resumenTarjeta(fila),
		nombre_empresa: fila.nombre_empresa,
		cover_url: fila.cover_url,
		created_at: fila.created_at,
		tema: {
			color_fondo: tema.color_fondo,
			color_superficie: tema.color_superficie,
			color_borde: tema.color_borde,
			color_titulo: tema.color_titulo,
			color_texto_secundario: tema.color_texto_secundario,
			color_primario: tema.color_primario,
			color_texto_sobre_primario: tema.color_texto_sobre_primario,
			color_overlay_portada: tema.color_overlay_portada,
			overlay_opacidad: tema.overlay_opacidad,
			tipografia: tema.tipografia
		},
		propietario: propietarioDe(fila)
	};
}

export function completa(fila: TarjetaRow): TarjetaCompleta {
	return {
		...(sinEliminado(fila) as Tarjeta),
		theme: aRespuestaTema(temaMock.deTarjeta(fila.id)),
		seo: aRespuestaSeo(seoMock.deTarjeta(fila.id)),
		secciones: seccionMock.deTarjeta(fila.id).map(aRespuestaSeccion),
		contactos: contactoMock.listar(fila.id).map(aRespuestaContacto),
		ubicaciones: ubicacionMock.listar(fila.id).map(aRespuestaUbicacion),
		sociales: socialMock.listar(fila.id).map(aRespuestaSocial),
		vitrina: vitrinaMock.completa(fila.id),
		educacion: educacionMock.listar(fila.id).map(aRespuestaEducacion),
		certificaciones: certificacionMock.listar(fila.id).map(aRespuestaCertificacion),
		faq: faqMock.listar(fila.id).map(aRespuestaFaq),
		propietario: propietarioDe(fila)
	};
}

/**
 * Lo que ve un visitante: solo tarjetas publicadas de cuentas activas con plan Pro vigente, solo lo visible y nada de
 * las secciones ocultas. Cualquier otro caso responde 404 (no se revela si existe).
 */
function publica(slug: string): TarjetaPublica {
	const fila = db.tarjetas.activas().find((t) => t.slug === slug.toLowerCase());
	const propietario = fila ? db.usuarios.buscar(fila.user_id) : undefined;
	if (!fila || !fila.is_public || !propietario?.is_active || !puedePublicar(propietario)) {
		throw error.noEncontrado('Esta tarjeta no existe o todavía no está publicada.');
	}
	const { propietario: _propietario, user_id: _userId, ...tarjeta } = completa(fila);
	const visible = (clave: string) =>
		tarjeta.secciones.some((s) => s.clave === clave && s.is_visible);
	const categoriasVisibles = tarjeta.vitrina.categorias.filter((c) => c.is_visible);
	const idsCategorias = new Set(categoriasVisibles.map((c) => c.id));

	return {
		...tarjeta,
		acerca_de_mi: visible('acerca') ? tarjeta.acerca_de_mi : null,
		qr_pago_url: visible('acciones') ? tarjeta.qr_pago_url : null,
		contactos: tarjeta.contactos.filter((c) => c.is_visible),
		ubicaciones: visible('ubicacion') ? tarjeta.ubicaciones.filter((u) => u.is_visible) : [],
		sociales: tarjeta.sociales.filter((s) => s.is_visible),
		vitrina: {
			...tarjeta.vitrina,
			categorias: visible('vitrina') ? categoriasVisibles : [],
			items: visible('vitrina')
				? tarjeta.vitrina.items.filter(
						(i) => i.is_visible && (!i.categoria_id || idsCategorias.has(i.categoria_id))
					)
				: []
		},
		educacion: visible('educacion') ? tarjeta.educacion.filter((e) => e.is_visible) : [],
		certificaciones: visible('certificaciones')
			? tarjeta.certificaciones.filter((c) => c.is_visible)
			: [],
		faq: visible('faq') ? tarjeta.faq.filter((f) => f.is_visible) : []
	};
}

/** Un enlace queda tomado aunque su tarjeta se elimine: así ningún QR impreso apunta a otra persona */
function slugEnUso(slug: string, excluirId?: string): boolean {
	return db.tarjetas.todas().some((t) => t.slug === slug && t.id !== excluirId);
}

function slugLibre(base: string, excluirId?: string): string {
	for (let numero = 2; numero < 100; numero++) {
		const candidato = `${base}-${numero}`.slice(0, 80);
		if (!slugEnUso(candidato, excluirId) && !SLUGS_RESERVADOS.has(candidato)) return candidato;
	}
	return `${base}-${nuevoId().slice(0, 6)}`;
}

function slugDisponible(slug: string, excluirId?: string): SlugDisponibilidad {
	const formato = slugSchema.safeParse(slug);
	if (!formato.success) {
		return {
			slug,
			disponible: false,
			motivo: formato.error.issues[0]?.message ?? null,
			sugerencia: null
		};
	}
	if (slugEnUso(formato.data, excluirId)) {
		return {
			slug: formato.data,
			disponible: false,
			motivo: 'Ese enlace ya está en uso.',
			sugerencia: slugLibre(formato.data, excluirId)
		};
	}
	return { slug: formato.data, disponible: true, motivo: null, sugerencia: null };
}

function conflictoDeSlug(slug: string, excluirId?: string): never {
	const sugerencia = slugLibre(slug, excluirId);
	const mensaje = `Ese enlace ya está en uso. Prueba con ${sugerencia}.`;
	throw error.conflicto(mensaje, { slug: mensaje });
}

/**
 * Crea la tarjeta de un usuario con todo su contenido: tema (el del rubro si no viene), SEO, las 9
 * secciones, contactos, ubicaciones con horarios, redes, vitrina con categorías e ítems con
 * imágenes, formación, certificaciones y preguntas. Usar dentro de `enTransaccion`.
 */
function crearAnidada(userId: string, cuerpo: unknown): TarjetaRow {
	const datos = validar(tarjetaNuevaSchema, cuerpo);
	if (deUsuario(userId)) {
		throw error.conflicto('Esta cuenta ya tiene una tarjeta.', {
			user_id: 'Esta cuenta ya tiene una tarjeta.'
		});
	}
	if (slugEnUso(datos.slug)) conflictoDeSlug(datos.slug);
	if (datos.is_public) exigirPlanParaPublicar(userId);

	const marca = ahora();
	const fila = db.tarjetas.insertar({
		id: nuevoId(),
		user_id: userId,
		slug: datos.slug,
		rubro: datos.rubro,
		prefijo: datos.prefijo,
		nombres: datos.nombres,
		apellidos: datos.apellidos,
		cargo: datos.cargo,
		nombre_empresa: datos.nombre_empresa,
		acerca_de_mi: datos.acerca_de_mi,
		profile_url: datos.profile_url,
		photo_usuario_url: datos.photo_usuario_url,
		logo_empresa_url: datos.logo_empresa_url,
		nombre_empresa_posicion: datos.nombre_empresa_posicion ?? 'derecha',
		cover_url: datos.cover_url,
		qr_tarjeta_url: null,
		qr_pago_url: datos.qr_pago_url,
		is_public: !!datos.is_public,
		published_at: datos.is_public ? marca : null,
		created_at: marca,
		updated_at: marca,
		is_deleted: false
	});

	temaMock.crearParaTarjeta(fila.id, datos.rubro, datos.theme ?? {});
	seoMock.crearParaTarjeta(fila.id, datos.seo ?? {});
	seccionMock.crearParaTarjeta(fila.id, datos.rubro, datos.secciones ?? []);
	for (const contacto of datos.contactos ?? []) contactoMock.crear(fila.id, contacto);
	for (const ubicacion of datos.ubicaciones ?? []) ubicacionMock.crear(fila.id, ubicacion);
	for (const social of datos.sociales ?? []) socialMock.crear(fila.id, social);
	vitrinaMock.crearParaTarjeta(fila.id, datos.vitrina ?? {});
	for (const estudio of datos.educacion ?? []) educacionMock.crear(fila.id, estudio);
	for (const certificacion of datos.certificaciones ?? [])
		certificacionMock.crear(fila.id, certificacion);
	for (const pregunta of datos.faq ?? []) faqMock.crear(fila.id, pregunta);
	return fila;
}

function actualizar(fila: TarjetaRow, cuerpo: unknown, sesion: Sesion): TarjetaRow {
	const cambios = (typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {}) as Record<
		string,
		unknown
	>;
	const cambiaSlug = 'slug' in cambios && cambios.slug !== fila.slug;
	if (cambiaSlug && !canCambiarSlug(rolDe(sesion))) {
		throw error.prohibido(
			'Para cambiar el enlace de tu tarjeta, escríbenos: tus QR impresos dejarían de funcionar.'
		);
	}
	const datos = validar(tarjetaEditarSchema, { ...fila, ...cambios });
	if (datos.slug !== fila.slug && slugEnUso(datos.slug, fila.id))
		conflictoDeSlug(datos.slug, fila.id);
	return db.tarjetas.actualizar(fila.id, {
		slug: datos.slug,
		rubro: datos.rubro,
		prefijo: datos.prefijo,
		nombres: datos.nombres,
		apellidos: datos.apellidos,
		cargo: datos.cargo,
		nombre_empresa: datos.nombre_empresa,
		acerca_de_mi: datos.acerca_de_mi,
		profile_url: datos.profile_url,
		photo_usuario_url: datos.photo_usuario_url,
		logo_empresa_url: datos.logo_empresa_url,
		nombre_empresa_posicion: datos.nombre_empresa_posicion ?? fila.nombre_empresa_posicion,
		cover_url: datos.cover_url,
		qr_pago_url: datos.qr_pago_url,
		updated_at: ahora()
	});
}

/** Publicar (solo con plan Pro) fija `published_at` la primera vez; despublicar lo conserva */
function publicar(fila: TarjetaRow, cuerpo: unknown): TarjetaRow {
	const { is_public } = validar(
		z.object({ is_public: z.boolean({ message: 'Indica si la tarjeta se publica.' }) }),
		cuerpo
	);
	if (is_public) exigirPlanParaPublicar(fila.user_id);
	const marca = ahora();
	return db.tarjetas.actualizar(fila.id, {
		is_public,
		published_at: is_public ? (fila.published_at ?? marca) : fila.published_at,
		updated_at: marca
	});
}

/** Borrado lógico en cascada de la tarjeta y todo su contenido */
function eliminar(fila: TarjetaRow): void {
	temaMock.eliminarDeTarjeta(fila.id);
	seoMock.eliminarDeTarjeta(fila.id);
	seccionMock.eliminarDeTarjeta(fila.id);
	contactoMock.eliminarDelPadre(fila.id);
	ubicacionMock.eliminarDelPadre(fila.id);
	socialMock.eliminarDelPadre(fila.id);
	vitrinaMock.eliminarDeTarjeta(fila.id);
	educacionMock.eliminarDelPadre(fila.id);
	certificacionMock.eliminarDelPadre(fila.id);
	faqMock.eliminarDelPadre(fila.id);
	db.tarjetas.eliminar(fila.id, { is_public: false, updated_at: ahora() });
}

function eliminarDeUsuario(userId: string): void {
	const fila = deUsuario(userId);
	if (fila) eliminar(fila);
}

/** La cuenta perdió el plan Pro: su tarjeta vuelve a borrador (`published_at` se conserva) */
function despublicarDeUsuario(userId: string): void {
	const fila = deUsuario(userId);
	if (fila?.is_public) db.tarjetas.actualizar(fila.id, { is_public: false, updated_at: ahora() });
}

/** Directorio del superadmin: busca en nombre, slug, rubro, empresa y email del propietario */
function listar(query: URLSearchParams): TarjetaListItem[] {
	const buscado = normalizarTexto(query.get('q') ?? '');
	const rubro = normalizarTexto(query.get('rubro') ?? '');
	const estado = query.get('estado');
	return db.tarjetas
		.activas()
		.filter((fila) => {
			if (estado === 'publicada' && !fila.is_public) return false;
			if (estado === 'borrador' && fila.is_public) return false;
			if (rubro && normalizarTexto(fila.rubro) !== rubro) return false;
			if (!buscado) return true;
			const texto = normalizarTexto(
				[
					nombreCompleto(fila),
					fila.slug,
					fila.rubro,
					fila.nombre_empresa,
					propietarioDe(fila).email
				].join(' ')
			);
			return texto.includes(buscado);
		})
		.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
		.map(itemDeLista);
}

export const tarjetaMock = {
	obtenerFila,
	deUsuario,
	completa,
	publica,
	slugDisponible,
	crearAnidada,
	actualizar,
	publicar,
	eliminar,
	eliminarDeUsuario,
	despublicarDeUsuario,
	listar
};

export const tarjetaRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/tarjetas',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.READ);
			if (!esSuperadmin(sesion)) throw error.prohibido();
			return paginar(listar(ctx.query), ctx.query);
		}
	},
	{
		metodo: 'POST',
		patron: '/tarjetas',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.CREATE);
			if (!esSuperadmin(sesion)) throw error.prohibido();
			const { user_id } = validar(
				z.object({
					user_id: z.string({ message: 'Elige la cuenta.' }).min(1, { message: 'Elige la cuenta.' })
				}),
				ctx.cuerpo
			);
			const usuario = db.usuarios.buscar(user_id);
			if (!usuario) throw error.validacion({ user_id: 'Esa cuenta no existe.' });
			if (usuario.rol !== Role.OWNER) {
				throw error.validacion({ user_id: 'Solo las cuentas de propietario tienen tarjeta.' });
			}
			const fila = enTransaccion(() => crearAnidada(user_id, ctx.cuerpo));
			return completa(fila);
		}
	},
	{
		metodo: 'GET',
		patron: '/tarjetas/mia',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.READ);
			const fila = deUsuario(sesion.usuario.id);
			if (!fila) throw error.noEncontrado('Todavía no tienes una tarjeta.');
			return completa(fila);
		}
	},
	{
		metodo: 'POST',
		patron: '/tarjetas/mia',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.CREATE);
			if (rolDe(sesion) !== Role.OWNER) {
				throw error.prohibido('Solo las cuentas de propietario tienen tarjeta.');
			}
			const fila = enTransaccion(() => crearAnidada(sesion.usuario.id, ctx.cuerpo));
			return completa(fila);
		}
	},
	{
		metodo: 'GET',
		patron: '/tarjetas/slug-disponible',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.READ);
			return slugDisponible(ctx.query.get('slug') ?? '', ctx.query.get('excluir') ?? undefined);
		}
	},
	{
		metodo: 'GET',
		patron: '/tarjetas/:id',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.READ);
			return completa(exigirAccesoTarjeta(sesion, ctx.params.id));
		}
	},
	{
		metodo: 'PATCH',
		patron: '/tarjetas/:id',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.UPDATE);
			const fila = exigirAccesoTarjeta(sesion, ctx.params.id);
			return sinEliminado(enTransaccion(() => actualizar(fila, ctx.cuerpo, sesion)));
		}
	},
	{
		metodo: 'PATCH',
		patron: '/tarjetas/:id/publicacion',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.UPDATE);
			const fila = exigirAccesoTarjeta(sesion, ctx.params.id);
			return sinEliminado(enTransaccion(() => publicar(fila, ctx.cuerpo)));
		}
	},
	{
		metodo: 'DELETE',
		patron: '/tarjetas/:id',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TARJETA, Action.DELETE);
			const fila = exigirAccesoTarjeta(sesion, ctx.params.id);
			enTransaccion(() => eliminar(fila));
			return {};
		}
	},
	{
		// Para el registro: todavía no hay sesión
		metodo: 'GET',
		patron: '/public/slug-disponible',
		publica: true,
		manejar: (ctx) => slugDisponible(ctx.query.get('slug') ?? '')
	},
	{
		metodo: 'GET',
		patron: '/public/tarjetas/:slug',
		publica: true,
		manejar: (ctx) => publica(ctx.params.slug)
	}
];

export { obtenerFila as obtenerTarjeta };
