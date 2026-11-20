import { Module, Role } from '#lib/config/permissions.config.ts';
import { Plan, planVigente, puedePublicar } from '#lib/config/planes.config.ts';
import { normalizarTexto } from '#lib/config/rubros.config.ts';
import type { Usuario, UsuarioCreateResponse, UsuarioListItem } from '#lib/interfaces/index.ts';
import { nombreCompleto } from '#lib/utils/tarjeta.ts';
import {
	registroSchema,
	usuarioCreateSchema,
	usuarioPasswordSchema,
	usuarioUpdateSchema
} from '#lib/zod/usuario.schema.ts';
import {
	Action,
	ahora,
	error,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	paginar,
	validar,
	type RutaMock,
	type Sesion
} from '../db/contexto';
import { cerrarSesionesDe, hashPassword } from '../db/sesion';
import { enTransaccion } from '../db/storage';
import { db, type UsuarioRow } from '../db/tablas';
import { resumenTarjeta, tarjetaMock } from './tarjeta.mock';

/**
 * Modelo `usuario`. Lo gestiona el superadmin (al crearlo puede nacer con su tarjeta completa); un
 * visitante también puede registrarse solo (`registrar`), siempre como propietario free.
 */

/** El usuario como lo devuelve la API: sin hash de contraseña ni `is_deleted` */
export function usuarioPublico(fila: UsuarioRow): Usuario {
	const { password_hash: _hash, is_deleted: _eliminado, ...usuario } = fila;
	return usuario;
}

function obtener(id: string): UsuarioRow {
	const fila = db.usuarios.buscar(id);
	if (!fila) throw error.noEncontrado('La cuenta no existe.');
	return fila;
}

function itemDeLista(fila: UsuarioRow): UsuarioListItem {
	const tarjeta = tarjetaMock.deUsuario(fila.id);
	return { ...usuarioPublico(fila), tarjeta: tarjeta ? resumenTarjeta(tarjeta) : null };
}

function emailEnUso(email: string, excluirId?: string): boolean {
	return db.usuarios.activas().some((u) => u.email === email && u.id !== excluirId);
}

function superadminsActivos(): UsuarioRow[] {
	return db.usuarios.donde((u) => u.rol === Role.SUPERADMIN && u.is_active);
}

const EMAIL_EN_USO = 'Ya existe una cuenta con ese correo.';

/** Busca en el email y en el nombre o slug de su tarjeta */
function listar(query: URLSearchParams): UsuarioListItem[] {
	const buscado = normalizarTexto(query.get('q') ?? '');
	const rol = query.get('rol');
	const estado = query.get('estado');
	const plan = query.get('plan');
	return db.usuarios
		.activas()
		.filter((fila) => {
			if (rol && fila.rol !== rol) return false;
			if (estado === 'activo' && !fila.is_active) return false;
			if (estado === 'inactivo' && fila.is_active) return false;
			if (plan && planVigente(fila) !== plan) return false;
			if (!buscado) return true;
			const tarjeta = tarjetaMock.deUsuario(fila.id);
			const texto = normalizarTexto(
				[fila.email, tarjeta ? nombreCompleto(tarjeta) : '', tarjeta?.slug ?? ''].join(' ')
			);
			return texto.includes(buscado);
		})
		.sort((a, b) => b.created_at.localeCompare(a.created_at))
		.map(itemDeLista);
}

interface NuevaCuenta {
	email: string;
	passwordHash: string;
	rol: Role;
	is_active: boolean;
	plan: Plan;
	plan_vence_at: string | null;
	tarjeta?: unknown;
}

/** Inserta la cuenta y, si viene, su tarjeta (que pide Pro si nace publicada). Usar en `enTransaccion` */
function insertar(cuenta: NuevaCuenta): UsuarioCreateResponse {
	const marca = ahora();
	// El plan solo tiene sentido en un propietario
	const esOwner = cuenta.rol === Role.OWNER;
	const usuario = db.usuarios.insertar({
		id: nuevoId(),
		email: cuenta.email,
		rol: cuenta.rol,
		plan: esOwner ? cuenta.plan : Plan.FREE,
		plan_vence_at: esOwner && cuenta.plan === Plan.PRO ? cuenta.plan_vence_at : null,
		is_active: cuenta.is_active,
		last_login_at: null,
		password_hash: cuenta.passwordHash,
		created_at: marca,
		updated_at: marca,
		is_deleted: false
	});
	const tarjeta = cuenta.tarjeta ? tarjetaMock.crearAnidada(usuario.id, cuenta.tarjeta) : null;
	return { ...usuarioPublico(usuario), tarjeta: tarjeta ? tarjetaMock.completa(tarjeta) : null };
}

/** Crea la cuenta y, si viene `tarjeta`, su tarjeta completa: todo o nada */
async function crear(cuerpo: unknown): Promise<UsuarioCreateResponse> {
	const datos = validar(usuarioCreateSchema, cuerpo);
	if (emailEnUso(datos.email)) throw error.conflicto(EMAIL_EN_USO, { email: EMAIL_EN_USO });
	if (datos.tarjeta && datos.rol !== Role.OWNER) {
		throw error.validacion({ rol: 'Solo las cuentas de propietario tienen tarjeta.' });
	}
	const passwordHash = await hashPassword(datos.password);

	return enTransaccion(() =>
		insertar({
			email: datos.email,
			passwordHash,
			rol: datos.rol,
			is_active: datos.is_active ?? true,
			plan: datos.plan ?? Plan.FREE,
			plan_vence_at: datos.plan_vence_at ?? null,
			tarjeta: datos.tarjeta
		})
	);
}

/**
 * Registro propio (`POST /auth/registro`): propietario, plan free y su tarjeta en borrador, venga
 * lo que venga en el cuerpo. Devuelve la cuenta para abrirle la sesión.
 */
async function registrar(cuerpo: unknown): Promise<UsuarioCreateResponse> {
	const datos = validar(registroSchema, cuerpo);
	if (emailEnUso(datos.email)) {
		const mensaje = 'Ya existe una cuenta con ese correo. Inicia sesión.';
		throw error.conflicto(mensaje, { email: mensaje });
	}
	const passwordHash = await hashPassword(datos.password);
	return enTransaccion(() =>
		insertar({
			email: datos.email,
			passwordHash,
			rol: Role.OWNER,
			is_active: true,
			plan: Plan.FREE,
			plan_vence_at: null,
			tarjeta: { ...datos.tarjeta, is_public: false }
		})
	);
}

/** El plan que queda tras un cambio: free nunca vence; pasar a pro sin fecha = no vence */
function planTrasCambio(
	actual: UsuarioRow,
	datos: { plan?: Plan; plan_vence_at?: string | null },
	rol: string
): Pick<UsuarioRow, 'plan' | 'plan_vence_at'> {
	if (rol !== Role.OWNER) return { plan: Plan.FREE, plan_vence_at: null };
	const plan = datos.plan ?? planVigente(actual);
	if (plan !== Plan.PRO) {
		if (datos.plan_vence_at) {
			throw error.validacion({ plan_vence_at: 'Solo el plan Pro tiene vencimiento.' });
		}
		return { plan: Plan.FREE, plan_vence_at: null };
	}
	if (datos.plan_vence_at !== undefined)
		return { plan, plan_vence_at: datos.plan_vence_at ?? null };
	// Sigue en pro sin tocar la fecha: la conserva; recién pasa a pro: no vence
	return { plan, plan_vence_at: actual.plan === Plan.PRO ? actual.plan_vence_at : null };
}

function actualizar(id: string, cuerpo: unknown, sesion: Sesion): UsuarioListItem {
	const actual = obtener(id);
	const datos = validar(usuarioUpdateSchema, cuerpo);
	const esPropia = id === sesion.usuario.id;

	if (esPropia && datos.is_active === false) {
		throw error.validacion({ is_active: 'No puedes desactivar tu propia cuenta.' });
	}
	if (esPropia && datos.rol && datos.rol !== actual.rol) {
		throw error.validacion({ rol: 'No puedes cambiar tu propio rol.' });
	}
	const dejaDeSerSuperadmin =
		actual.rol === Role.SUPERADMIN &&
		((datos.rol !== undefined && datos.rol !== Role.SUPERADMIN) || datos.is_active === false);
	if (dejaDeSerSuperadmin && superadminsActivos().length <= 1) {
		throw error.conflicto('Debe quedar al menos un superadministrador activo.');
	}
	if (
		datos.rol === Role.SUPERADMIN &&
		actual.rol !== Role.SUPERADMIN &&
		tarjetaMock.deUsuario(id)
	) {
		const mensaje = 'Esta cuenta tiene una tarjeta: un superadministrador no tiene tarjeta propia.';
		throw error.conflicto(mensaje, { rol: mensaje });
	}
	if (datos.email && datos.email !== actual.email && emailEnUso(datos.email, id)) {
		throw error.conflicto(EMAIL_EN_USO, { email: EMAIL_EN_USO });
	}

	const fila = enTransaccion(() => {
		const actualizada = db.usuarios.actualizar(id, {
			...(datos.email !== undefined && { email: datos.email }),
			...(datos.rol !== undefined && { rol: datos.rol }),
			...(datos.is_active !== undefined && { is_active: datos.is_active }),
			...planTrasCambio(actual, datos, datos.rol ?? actual.rol),
			updated_at: ahora()
		});
		// Sin plan Pro no hay tarjeta publicada
		if (!puedePublicar(actualizada)) tarjetaMock.despublicarDeUsuario(id);
		return actualizada;
	});
	if (datos.is_active === false) cerrarSesionesDe(id);
	return itemDeLista(fila);
}

/** Contraseña nueva definida por el superadmin; cierra las sesiones de esa cuenta */
async function restablecerPassword(id: string, cuerpo: unknown): Promise<void> {
	obtener(id);
	const { password } = validar(usuarioPasswordSchema, cuerpo);
	const passwordHash = await hashPassword(password);
	db.usuarios.actualizar(id, { password_hash: passwordHash, updated_at: ahora() });
	cerrarSesionesDe(id);
}

/** Borrado lógico de la cuenta y, en cascada, de su tarjeta */
function eliminar(id: string, sesion: Sesion): void {
	const actual = obtener(id);
	if (id === sesion.usuario.id) throw error.conflicto('No puedes eliminar tu propia cuenta.');
	if (actual.rol === Role.SUPERADMIN && actual.is_active && superadminsActivos().length <= 1) {
		throw error.conflicto('Debe quedar al menos un superadministrador activo.');
	}
	enTransaccion(() => {
		tarjetaMock.eliminarDeUsuario(id);
		db.usuarios.eliminar(id, { is_active: false, updated_at: ahora() });
	});
	cerrarSesionesDe(id);
}

/**
 * Vencimiento de planes (en el backend real, una tarea programada; aquí corre antes de cada
 * petición): cada pro vencido vuelve a free y su tarjeta a borrador.
 */
function aplicarVencimientos(momento: Date = new Date()): number {
	const vencidas = db.usuarios
		.activas()
		.filter((fila) => fila.plan === Plan.PRO && planVigente(fila, momento) === Plan.FREE);
	if (vencidas.length === 0) return 0;
	enTransaccion(() => {
		for (const fila of vencidas) {
			db.usuarios.actualizar(fila.id, {
				plan: Plan.FREE,
				plan_vence_at: null,
				updated_at: ahora()
			});
			tarjetaMock.despublicarDeUsuario(fila.id);
		}
	});
	return vencidas.length;
}

export const usuarioMock = {
	obtener,
	listar,
	crear,
	registrar,
	actualizar,
	restablecerPassword,
	eliminar,
	aplicarVencimientos
};

export const usuarioRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/usuarios',
		manejar: (ctx) => {
			exigirPermiso(exigirSesion(ctx), Module.USUARIO, Action.READ);
			return paginar(listar(ctx.query), ctx.query);
		}
	},
	{
		metodo: 'POST',
		patron: '/usuarios',
		manejar: (ctx) => {
			exigirPermiso(exigirSesion(ctx), Module.USUARIO, Action.CREATE);
			return crear(ctx.cuerpo);
		}
	},
	{
		metodo: 'GET',
		patron: '/usuarios/:id',
		manejar: (ctx) => {
			exigirPermiso(exigirSesion(ctx), Module.USUARIO, Action.READ);
			return itemDeLista(obtener(ctx.params.id));
		}
	},
	{
		metodo: 'PATCH',
		patron: '/usuarios/:id',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.USUARIO, Action.UPDATE);
			return actualizar(ctx.params.id, ctx.cuerpo, sesion);
		}
	},
	{
		metodo: 'PUT',
		patron: '/usuarios/:id/password',
		manejar: async (ctx) => {
			exigirPermiso(exigirSesion(ctx), Module.USUARIO, Action.UPDATE);
			await restablecerPassword(ctx.params.id, ctx.cuerpo);
			return {};
		}
	},
	{
		metodo: 'DELETE',
		patron: '/usuarios/:id',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.USUARIO, Action.DELETE);
			eliminar(ctx.params.id, sesion);
			return {};
		}
	}
];
