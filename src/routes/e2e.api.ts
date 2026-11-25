/**
 * API falsa para las E2E: responde con `page.route()` lo que pide el navegador, con un estado en
 * memoria por test armado desde los ejemplos del OpenAPI (`tests/fixtures/api.ejemplos.json`).
 * Sigue las reglas del backend que las pruebas necesitan (listas como estado final, preset en null
 * al tocar colores, publicar solo con plan pago vigente y email verificado, jerarquía de roles…) y
 * guarda cada petición para revisar qué se envió. Solo existe para los tests: no entra al build.
 *
 * Lo que se arma en el servidor (el perfil `/[slug]` y el QR `/t/[id]`) lo responde
 * `tests/apiPublica.mjs`.
 */
import type { Page, Request, Route } from '@playwright/test';
import type {
	PagoListItem,
	Plan,
	TarjetaCompleta,
	TarjetaPublica,
	UsuarioDetalle,
	UsuarioMe
} from '#lib/interfaces/index.ts';
import { readFileSync } from 'node:fs';
import { PNG_1X1 } from './e2e.utils';

/** Los ejemplos del OpenAPI: los mismos datos que sirve tests/apiPublica.mjs */
const ejemplos = JSON.parse(
	readFileSync(new URL('../../tests/fixtures/api.ejemplos.json', import.meta.url), 'utf8')
) as Record<string, unknown>;

const DIA = 86_400_000;
const ahora = () => new Date().toISOString();
const enDias = (dias: number) => new Date(Date.now() + dias * DIA).toISOString();
const copia = <T>(valor: T): T => structuredClone(valor);

export const TARJETA_PUBLICA = ejemplos.TarjetaPublic as unknown as TarjetaPublica;
const ME = ejemplos.UsuarioResponseMe as unknown as UsuarioMe;
const PLAN_PRO = ejemplos.PlanResponse as unknown as Plan;
const PLAN_FREE: Plan = {
	...PLAN_PRO,
	id: '7b1e9c40-0000-4000-8000-000000000001',
	codigo: 'free',
	nombre: 'Free',
	precio: '0.00',
	duracion_dias: 36500
};

export interface CuentaFalsa {
	email: string;
	password: string;
}

/** Las cuentas con que arranca cada test */
export const CUENTAS = {
	/** User con Pro vigente, email verificado y su tarjeta publicada (la del ejemplo del OpenAPI) */
	ana: { email: ME.email, password: 'ClaveSegura123' },
	/** User Free, sin verificar, con su tarjeta en borrador */
	nuevo: { email: 'nuevo@me.test', password: 'Clave1234' },
	/** User creado por un admin, sin tarjeta */
	sinTarjeta: { email: 'sin-tarjeta@me.test', password: 'Clave1234' },
	/** User dado de baja */
	baja: { email: 'baja@me.test', password: 'Clave1234' },
	admin: { email: 'admin@me.test', password: 'Admin1234' },
	superadmin: { email: 'super@me.test', password: 'Super1234' }
} satisfies Record<string, CuentaFalsa>;

interface Registro {
	usuario: UsuarioDetalle;
	password: string;
	tarjeta: TarjetaCompleta | null;
}

export interface Llamada {
	metodo: string;
	ruta: string;
	cuerpo: unknown;
}

let secuencia = 0;
const nuevoId = (prefijo: string) =>
	`${prefijo}-0000-4000-8000-${String(++secuencia).padStart(12, '0')}`;

function usuarioBase(id: string, email: string, rol: string, plan: Plan): UsuarioDetalle {
	return {
		id,
		email,
		rol,
		plan_id: plan.id,
		plan_vence_at: plan.codigo === 'free' ? enDias(36500) : enDias(200),
		is_active: true,
		email_verified_at: ahora(),
		created_at: ahora(),
		updated_at: ahora(),
		plan
	};
}

/** Una tarjeta nueva como la arma el backend: 8 secciones, theme claro, vitrina vacía */
function tarjetaNueva(id: string, userId: string, datos: Record<string, unknown>): TarjetaCompleta {
	const base = copia(ME.tarjeta!);
	return {
		...base,
		id,
		user_id: userId,
		slug: String(datos.slug),
		rubro: String(datos.rubro),
		prefijo: (datos.prefijo as string) ?? null,
		nombres: String(datos.nombres),
		apellidos: (datos.apellidos as string) ?? null,
		cargo: (datos.cargo as string) ?? null,
		nombre_empresa: null,
		acerca_de_mi: null,
		profile_url: null,
		photo_usuario_url: null,
		logo_empresa_url: null,
		cover_url: null,
		qr_pago_url: null,
		is_public: false,
		published_at: null,
		theme: { ...base.theme, id, preset: 'claro', tipografia: 1 },
		seo: { ...base.seo, id, meta_title: null, meta_description: null, og_image_url: null },
		secciones: base.secciones.map((s) => ({ ...s, id: nuevoId('sec'), tarjeta_id: id })),
		contactos: [],
		ubicaciones: [],
		redes: [],
		educaciones: [],
		certificaciones: [],
		faqs: [],
		vitrina: { ...base.vitrina, id, categorias: [], items: [] }
	};
}

function error(status: number, code: string, message: string, details?: Record<string, string>) {
	return { status, cuerpo: { status: status >= 500 ? 'error' : 'fail', code, message, details } };
}

const CAMPOS_PRESET = Object.keys(ME.tarjeta!.theme).filter(
	(c) => c.startsWith('color_') || ['overlay_opacidad', 'icono_forma', 'fab_posicion'].includes(c)
);
const RANGO: Record<string, number> = { superadmin: 3, admin: 2, user: 1 };

/** Lista enviada (estado final) → lista guardada: ids para lo nuevo, el resto se conserva */
function aplicarLista<T extends { id: string }>(
	actual: T[],
	enviada: Record<string, unknown>[],
	extra: Record<string, unknown>
): T[] {
	return enviada.map((elemento) => {
		const previo = actual.find((a) => a.id === elemento.id);
		const id = (elemento.id as string) ?? nuevoId('item');
		return { ...(previo ?? {}), ...extra, ...elemento, id, updated_at: ahora() } as unknown as T;
	});
}

export class ApiFalsa {
	readonly registros = new Map<string, Registro>();
	readonly planes: Plan[] = [copia(PLAN_FREE), copia(PLAN_PRO)];
	readonly pagos: PagoListItem[] = [];
	readonly llamadas: Llamada[] = [];
	private subidas = 0;

	constructor() {
		const ana = copia(ME);
		const { tarjeta, ...usuario } = ana;
		usuario.plan_vence_at = enDias(200);
		this.agregar({ usuario, password: CUENTAS.ana.password, tarjeta });

		const nuevoUsuario = usuarioBase(nuevoId('usr'), CUENTAS.nuevo.email, 'user', PLAN_FREE);
		nuevoUsuario.email_verified_at = null;
		this.agregar({
			usuario: nuevoUsuario,
			password: CUENTAS.nuevo.password,
			tarjeta: tarjetaNueva(nuevoId('trj'), nuevoUsuario.id, {
				slug: 'nuevo-perfil',
				rubro: 'Diseño gráfico',
				nombres: 'Nuevo',
				apellidos: 'Perfil'
			})
		});
		for (const [clave, rol, plan] of [
			['sinTarjeta', 'user', PLAN_FREE],
			['baja', 'user', PLAN_FREE],
			['admin', 'admin', PLAN_FREE],
			['superadmin', 'superadmin', PLAN_FREE]
		] as const) {
			const usuario = usuarioBase(nuevoId('usr'), CUENTAS[clave].email, rol, plan);
			if (clave === 'baja') usuario.is_active = false;
			this.agregar({ usuario, password: CUENTAS[clave].password, tarjeta: null });
		}
	}

	agregar(registro: Registro): void {
		this.registros.set(registro.usuario.id, registro);
	}

	porEmail(email: string): Registro | undefined {
		return [...this.registros.values()].find((r) => r.usuario.email === email);
	}

	/** Cambia un registro antes de que el test abra la página */
	modificar(email: string, cambio: (registro: Registro) => void): void {
		const registro = this.porEmail(email);
		if (!registro) throw new Error(`No existe ${email}`);
		cambio(registro);
	}

	/** Las llamadas a una ruta (sin el prefijo /api/v1), en orden */
	llamadasA(metodo: string, ruta: string | RegExp): Llamada[] {
		return this.llamadas.filter(
			(l) => l.metodo === metodo && (typeof ruta === 'string' ? l.ruta === ruta : ruta.test(l.ruta))
		);
	}

	private tarjetas(): TarjetaCompleta[] {
		return [...this.registros.values()].flatMap((r) => (r.tarjeta ? [r.tarjeta] : []));
	}

	private registroDeTarjeta(id: string): Registro | undefined {
		return [...this.registros.values()].find((r) => r.tarjeta?.id === id);
	}

	private sesion(request: Request): Registro | undefined {
		const token = request.headers()['authorization']?.replace(/^Bearer /, '');
		return token ? this.registros.get(token.replace(/^token-/, '')) : undefined;
	}

	private listItem(u: UsuarioDetalle) {
		return { ...u, plan: { id: u.plan.id, nombre: u.plan.nombre } };
	}

	private detalle(registro: Registro) {
		const { theme: _t, seo: _s, vitrina: _v, ...tarjeta } = registro.tarjeta!;
		const { plan: _p, ...user } = registro.usuario;
		return { ...tarjeta, user };
	}

	private paginar<T>(lista: T[], url: URL) {
		const page = Number(url.searchParams.get('page') ?? 1);
		const perPage = Number(url.searchParams.get('per_page') ?? 20);
		return {
			total: lista.length,
			page,
			per_page: perPage,
			total_pages: Math.max(1, Math.ceil(lista.length / perPage)),
			data: lista.slice((page - 1) * perPage, page * perPage)
		};
	}

	/** Responde una petición: { status, cuerpo } (cuerpo undefined = sin contenido) */
	private manejar(
		metodo: string,
		ruta: string,
		url: URL,
		cuerpo: Record<string, unknown>,
		request: Request
	): { status: number; cuerpo?: unknown } {
		const yo = this.sesion(request);
		const partes = ruta.split('/').filter(Boolean);
		const [recurso, id, accion] = partes;

		// Autenticación
		if (metodo === 'POST' && ruta === '/auth/login') {
			const registro = this.porEmail(String(cuerpo.email));
			if (!registro || registro.password !== cuerpo.password) {
				return error(401, 'AUTHENTICATION_FAILED', 'El correo o la contraseña no son correctos.');
			}
			if (!registro.usuario.is_active) {
				return error(403, 'PERMISSION_DENIED', 'Esta cuenta está dada de baja.');
			}
			return {
				status: 200,
				cuerpo: {
					access_token: `token-${registro.usuario.id}`,
					csrf_token: 'csrf',
					token_type: 'bearer'
				}
			};
		}
		if (metodo === 'POST' && ruta === '/auth/refresh') {
			return error(401, 'REFRESH_FAILED', 'La sesión expiró.');
		}
		if (metodo === 'POST' && ruta === '/auth/logout') return { status: 204 };
		if (metodo === 'POST' && ruta === '/auth/register') {
			const tarjeta = cuerpo.tarjeta as Record<string, unknown>;
			if (this.porEmail(String(cuerpo.email))) {
				return error(409, 'CONFLICT', 'Ya hay una cuenta con este correo.', {
					email: 'Ya hay una cuenta con este correo.'
				});
			}
			if (this.tarjetas().some((t) => t.slug === tarjeta.slug)) {
				return error(409, 'CONFLICT', 'Ese enlace ya está en uso.', {
					'tarjeta -> slug': 'Ese enlace ya está en uso.'
				});
			}
			const usuario = usuarioBase(nuevoId('usr'), String(cuerpo.email), 'user', this.planes[0]);
			usuario.email_verified_at = null;
			const nueva = tarjetaNueva(nuevoId('trj'), usuario.id, tarjeta);
			const preset = (tarjeta.theme as { preset?: string } | undefined)?.preset;
			if (preset) nueva.theme.preset = preset as TarjetaCompleta['theme']['preset'];
			this.agregar({ usuario, password: String(cuerpo.password), tarjeta: nueva });
			return { status: 201 };
		}
		if (metodo === 'POST' && ruta === '/auth/forgot-password') return { status: 204 };
		if (metodo === 'POST' && ruta === '/auth/reset-password') {
			return cuerpo.token === 'valido'
				? { status: 204 }
				: error(422, 'TOKEN_INVALID', 'El enlace venció o ya se usó.');
		}
		if (metodo === 'POST' && ruta === '/auth/verify-email') {
			if (cuerpo.token !== 'valido') {
				return error(422, 'TOKEN_INVALID', 'El enlace venció o ya se usó.');
			}
			const registro = yo ?? this.porEmail(CUENTAS.nuevo.email);
			if (registro) registro.usuario.email_verified_at = ahora();
			return { status: 204 };
		}
		// Públicas (con sesión opcional)
		if (ruta.startsWith('/tarjetas/public/slug-disponible/')) {
			const slug = decodeURIComponent(partes[3]);
			const propia = yo?.tarjeta?.slug === slug;
			return {
				status: 200,
				cuerpo: { slug, disponible: propia || !this.tarjetas().some((t) => t.slug === slug) }
			};
		}
		if (ruta === '/planes/public') {
			return { status: 200, cuerpo: this.planes.filter((p) => p.is_visible) };
		}
		if (!yo) return error(401, 'TOKEN_REQUIRED', 'Debes iniciar sesión.');

		if (metodo === 'POST' && ruta === '/auth/resend-verification') return { status: 204 };
		if (metodo === 'POST' && ruta === '/auth/change-password') {
			if (cuerpo.current_password !== yo.password) {
				return error(401, 'AUTHENTICATION_FAILED', 'La contraseña actual no es correcta.');
			}
			yo.password = String(cuerpo.new_password);
			return {
				status: 200,
				cuerpo: {
					access_token: `token-${yo.usuario.id}`,
					csrf_token: 'csrf-2',
					token_type: 'bearer'
				}
			};
		}

		// Usuarios
		if (ruta === '/usuarios/me') {
			if (metodo === 'PATCH') {
				yo.usuario.email = String(cuerpo.email);
				yo.usuario.email_verified_at = null;
				return { status: 200, cuerpo: yo.usuario };
			}
			return { status: 200, cuerpo: { ...yo.usuario, tarjeta: yo.tarjeta } };
		}
		const esAdmin = yo.usuario.rol !== 'user';
		if (recurso === 'usuarios') {
			if (!esAdmin) return error(403, 'PERMISSION_DENIED', 'No tienes permiso.');
			if (metodo === 'GET' && !id) {
				const rol = url.searchParams.get('rol');
				const activo = url.searchParams.get('is_active');
				const plan = url.searchParams.get('plan_id');
				const lista = [...this.registros.values()]
					.map((r) => r.usuario)
					.filter((u) => !rol || u.rol === rol)
					.filter((u) => activo === null || String(u.is_active) === activo)
					.filter((u) => !plan || u.plan_id === plan)
					.map((u) => this.listItem(u));
				return { status: 200, cuerpo: this.paginar(lista, url) };
			}
			if (metodo === 'POST' && !id) {
				if (this.porEmail(String(cuerpo.email))) {
					return error(409, 'CONFLICT', 'Ya hay una cuenta con este correo.', {
						email: 'Ya hay una cuenta con este correo.'
					});
				}
				const rol = String(cuerpo.rol ?? 'user');
				if (RANGO[rol] >= RANGO[yo.usuario.rol]) {
					return error(403, 'PERMISSION_DENIED', 'Solo puedes crear cuentas de un rol inferior.');
				}
				const usuario = usuarioBase(nuevoId('usr'), String(cuerpo.email), rol, this.planes[0]);
				usuario.email_verified_at = null;
				this.agregar({ usuario, password: String(cuerpo.password), tarjeta: null });
				return { status: 201, cuerpo: usuario };
			}
			const registro = id ? this.registros.get(id) : undefined;
			if (!registro) return error(404, 'RESOURCE_NOT_FOUND', 'La cuenta no existe.');
			if (metodo === 'GET') return { status: 200, cuerpo: registro.usuario };
			if (RANGO[registro.usuario.rol] >= RANGO[yo.usuario.rol]) {
				return error(403, 'PERMISSION_DENIED', 'No puedes gestionar esta cuenta.');
			}
			if (metodo === 'PATCH') {
				Object.assign(registro.usuario, cuerpo);
				if (cuerpo.email) registro.usuario.email_verified_at = null;
				return { status: 200, cuerpo: registro.usuario };
			}
			if (metodo === 'DELETE') {
				if (yo.usuario.rol !== 'superadmin')
					return error(403, 'PERMISSION_DENIED', 'No tienes permiso.');
				if (registro.tarjeta || this.pagos.some((p) => p.user_id === registro.usuario.id)) {
					return error(409, 'CONFLICT', 'La cuenta tiene una tarjeta o pagos.');
				}
				this.registros.delete(registro.usuario.id);
				return { status: 204 };
			}
			if (metodo === 'POST' && accion === 'dar-de-baja') {
				registro.usuario.is_active = false;
				if (registro.tarjeta) registro.tarjeta.is_public = false;
				return { status: 200, cuerpo: registro.usuario };
			}
			if (metodo === 'POST' && accion === 'reactivar') {
				registro.usuario.is_active = true;
				return { status: 200, cuerpo: registro.usuario };
			}
		}

		// Planes y pagos
		if (recurso === 'planes') {
			if (metodo === 'GET') return { status: 200, cuerpo: this.paginar(this.planes, url) };
			const plan = this.planes.find((p) => p.id === id)!;
			Object.assign(plan, cuerpo, { precio: Number(cuerpo.precio ?? plan.precio).toFixed(2) });
			return { status: 200, cuerpo: plan };
		}
		if (recurso === 'pagos') {
			if (metodo === 'GET') {
				const userId = url.searchParams.get('user_id');
				const lista = this.pagos.filter((p) => !userId || p.user_id === userId);
				return { status: 200, cuerpo: this.paginar([...lista].reverse(), url) };
			}
			if (id === 'registrar') {
				const repetido = this.pagos.find((p) => p.idempotency_key === cuerpo.idempotency_key);
				if (repetido) return { status: 201, cuerpo: repetido };
				const registro = this.registros.get(String(cuerpo.user_id))!;
				const plan = this.planes.find((p) => p.id === cuerpo.plan_id)!;
				const inicio = Math.max(Date.now(), Date.parse(registro.usuario.plan_vence_at));
				const desde = registro.usuario.plan.codigo === 'free' ? Date.now() : inicio;
				const fin = new Date(desde + plan.duracion_dias * DIA).toISOString();
				const pago: PagoListItem = {
					id: nuevoId('pag'),
					user_id: registro.usuario.id,
					plan_id: plan.id,
					monto: Number(cuerpo.monto ?? plan.precio).toFixed(2),
					moneda: plan.moneda,
					metodo: cuerpo.metodo as PagoListItem['metodo'],
					referencia_externa: (cuerpo.referencia_externa as string) ?? null,
					comprobante_url: (cuerpo.comprobante_url as string) ?? null,
					periodo_inicio: new Date(desde).toISOString(),
					periodo_fin: fin,
					reverses_id: null,
					idempotency_key: String(cuerpo.idempotency_key),
					created_at: ahora(),
					updated_at: ahora(),
					user: { id: registro.usuario.id, email: registro.usuario.email },
					plan: { id: plan.id, nombre: plan.nombre }
				};
				this.pagos.push(pago);
				Object.assign(registro.usuario, { plan_id: plan.id, plan, plan_vence_at: fin });
				return { status: 201, cuerpo: { ...pago, user: registro.usuario, plan } };
			}
			if (accion === 'anular') {
				const pago = this.pagos.find((p) => p.id === id)!;
				const reverso = {
					...pago,
					id: nuevoId('pag'),
					monto: `-${pago.monto}`,
					reverses_id: pago.id,
					idempotency_key: `${pago.idempotency_key}-anulado`,
					created_at: ahora()
				};
				this.pagos.push(reverso);
				return { status: 200, cuerpo: reverso };
			}
		}

		// Imágenes y mantenimiento
		if (ruta === '/imagenes/uploads') {
			return {
				status: 201,
				cuerpo: {
					url: `https://res.cloudinary.com/demo/image/upload/v1/subida-${++this.subidas}.png`
				}
			};
		}
		if (ruta === '/imagenes/limpiar-huerfanas') {
			return { status: 200, cuerpo: { eliminadas: 2, conservadas: 0 } };
		}
		if (ruta === '/tarjetas/despublicar-vencidas')
			return { status: 200, cuerpo: { despublicadas: 0 } };

		// Tarjetas
		if (recurso === 'tarjetas' && !id) {
			if (metodo === 'GET') {
				const userId = url.searchParams.get('user_id');
				const publica = url.searchParams.get('is_public');
				const lista = [...this.registros.values()]
					.filter((r) => r.tarjeta && (esAdmin || r === yo))
					.filter((r) => !userId || r.usuario.id === userId)
					.filter((r) => publica === null || String(r.tarjeta!.is_public) === publica)
					.map((r) => {
						const {
							secciones: _s,
							contactos: _c,
							ubicaciones: _u,
							redes: _r,
							educaciones: _e,
							certificaciones: _ce,
							faqs: _f,
							...tarjeta
						} = this.detalle(r);
						return { ...tarjeta, user: { id: r.usuario.id, email: r.usuario.email } };
					});
				return { status: 200, cuerpo: this.paginar(lista, url) };
			}
			const duenio = cuerpo.user_id ? this.registros.get(String(cuerpo.user_id))! : yo;
			if (duenio.tarjeta) return error(409, 'CONFLICT', 'La cuenta ya tiene una tarjeta.');
			if (this.tarjetas().some((t) => t.slug === cuerpo.slug)) {
				return error(409, 'CONFLICT', 'Ese enlace ya está en uso.', {
					slug: 'Ese enlace ya está en uso.'
				});
			}
			duenio.tarjeta = tarjetaNueva(nuevoId('trj'), duenio.usuario.id, cuerpo);
			const tarjeta = duenio.tarjeta;
			for (const clave of ['contactos', 'redes'] as const) {
				if (Array.isArray(cuerpo[clave])) {
					tarjeta[clave] = aplicarLista([], cuerpo[clave] as Record<string, unknown>[], {
						tarjeta_id: tarjeta.id,
						is_visible: true
					}) as never;
				}
			}
			return { status: 201, cuerpo: this.detalle(duenio) };
		}
		if (recurso === 'tarjetas' && id) {
			const registro = this.registroDeTarjeta(id);
			if (!registro?.tarjeta) return error(404, 'RESOURCE_NOT_FOUND', 'La tarjeta no existe.');
			if (!esAdmin && registro !== yo) return error(403, 'PERMISSION_DENIED', 'No es tu tarjeta.');
			const tarjeta = registro.tarjeta;
			if (metodo === 'GET' && accion === 'completa') return { status: 200, cuerpo: tarjeta };
			if (metodo === 'DELETE') {
				registro.tarjeta = null;
				return { status: 204 };
			}
			if (accion === 'publicar') {
				const u = registro.usuario;
				if (u.plan.codigo === 'free')
					return error(409, 'CONFLICT', 'Publicar necesita un plan pago.');
				if (Date.parse(u.plan_vence_at) <= Date.now())
					return error(409, 'CONFLICT', 'El plan venció.');
				if (!u.email_verified_at) return error(409, 'CONFLICT', 'Falta verificar el correo.');
				Object.assign(tarjeta, { is_public: true, published_at: tarjeta.published_at ?? ahora() });
				return { status: 200, cuerpo: this.detalle(registro) };
			}
			if (accion === 'despublicar') {
				tarjeta.is_public = false;
				return { status: 200, cuerpo: this.detalle(registro) };
			}
			if (metodo === 'PATCH') {
				const listas = [
					'contactos',
					'ubicaciones',
					'redes',
					'educaciones',
					'certificaciones',
					'faqs',
					'secciones'
				];
				for (const [campo, valor] of Object.entries(cuerpo)) {
					if (listas.includes(campo)) {
						if (valor === null) continue;
						(tarjeta as unknown as Record<string, unknown>)[campo] = aplicarLista(
							(tarjeta as unknown as Record<string, { id: string }[]>)[campo],
							valor as Record<string, unknown>[],
							{ tarjeta_id: tarjeta.id }
						);
					} else {
						(tarjeta as unknown as Record<string, unknown>)[campo] = valor;
					}
				}
				return { status: 200, cuerpo: this.detalle(registro) };
			}
		}
		if (recurso === 'tarjeta-themes' && metodo === 'PATCH') {
			const tarjeta = this.registroDeTarjeta(id)!.tarjeta!;
			const tocaPreset = Object.keys(cuerpo).some((c) => CAMPOS_PRESET.includes(c));
			Object.assign(tarjeta.theme, cuerpo, tocaPreset ? { preset: null } : {});
			return { status: 200, cuerpo: tarjeta.theme };
		}
		if (recurso === 'tarjeta-seos' && metodo === 'PATCH') {
			const tarjeta = this.registroDeTarjeta(id)!.tarjeta!;
			Object.assign(tarjeta.seo, cuerpo);
			return { status: 200, cuerpo: tarjeta.seo };
		}
		if (recurso === 'vitrinas' && metodo === 'PATCH') {
			const vitrina = this.registroDeTarjeta(id)!.tarjeta!.vitrina;
			const { categorias, items, ...ajustes } = cuerpo;
			Object.assign(vitrina, ajustes);
			if (Array.isArray(categorias)) {
				vitrina.categorias = aplicarLista(vitrina.categorias, categorias, {
					vitrina_id: vitrina.id
				});
			}
			if (Array.isArray(items)) {
				vitrina.items = aplicarLista(vitrina.items, items, {
					vitrina_id: vitrina.id,
					categoria: null
				});
			}
			return { status: 200, cuerpo: vitrina };
		}
		return error(404, 'RESOURCE_NOT_FOUND', `Sin respuesta de prueba para ${metodo} ${ruta}`);
	}

	/** Conecta la API a la página: responde todo `…/api/v1/…` y las imágenes de Cloudinary */
	async instalar(page: Page): Promise<this> {
		await page.route(/^https:\/\/res\.cloudinary\.com\//, (route) =>
			route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 })
		);
		await page.route(/\/api\/v1\//, async (route: Route) => {
			const request = route.request();
			const url = new URL(request.url());
			const ruta = url.pathname.replace(/^.*\/api\/v1/, '');
			const metodo = request.method();
			// La app (:4173) y la API (:4010) son orígenes distintos y el login viaja con cookies
			const cors = {
				'Access-Control-Allow-Origin': request.headers()['origin'] ?? 'http://localhost:4173',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Allow-Headers': 'content-type, authorization, x-csrf-token',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
			};
			if (metodo === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
			let cuerpo: Record<string, unknown> = {};
			try {
				cuerpo = request.postDataJSON() ?? {};
			} catch {
				// multipart (subida de imágenes)
			}
			this.llamadas.push({ metodo, ruta, cuerpo });
			const respuesta = this.manejar(metodo, ruta, url, cuerpo, request);
			await route.fulfill({
				status: respuesta.status,
				contentType: 'application/json',
				headers: cors,
				body: respuesta.cuerpo === undefined ? '' : JSON.stringify(respuesta.cuerpo)
			});
		});
		return this;
	}
}

/** Una API falsa nueva, ya conectada a la página */
export function apiFalsa(page: Page): Promise<ApiFalsa> {
	return new ApiFalsa().instalar(page);
}
