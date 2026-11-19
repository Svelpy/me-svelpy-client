import { Module, Role } from '#lib/config/permissions.config.ts';
import { normalizarTexto } from '#lib/config/rubros.config.ts';
import type { Usuario, UsuarioCreateResponse, UsuarioListItem } from '#lib/interfaces/index.ts';
import { nombreCompleto } from '#lib/utils/tarjeta.ts';
import {
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

/** Modelo `usuario`. Solo el superadmin lo gestiona; al crearlo puede nacer con su tarjeta completa */

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
	return db.usuarios
		.activas()
		.filter((fila) => {
			if (rol && fila.rol !== rol) return false;
			if (estado === 'activo' && !fila.is_active) return false;
			if (estado === 'inactivo' && fila.is_active) return false;
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

/** Crea la cuenta y, si viene `tarjeta`, su tarjeta completa: todo o nada */
async function crear(cuerpo: unknown): Promise<UsuarioCreateResponse> {
	const datos = validar(usuarioCreateSchema, cuerpo);
	if (emailEnUso(datos.email)) throw error.conflicto(EMAIL_EN_USO, { email: EMAIL_EN_USO });
	if (datos.tarjeta && datos.rol !== Role.OWNER) {
		throw error.validacion({ rol: 'Solo las cuentas de propietario tienen tarjeta.' });
	}
	const passwordHash = await hashPassword(datos.password);

	return enTransaccion(() => {
		const marca = ahora();
		const usuario = db.usuarios.insertar({
			id: nuevoId(),
			email: datos.email,
			rol: datos.rol,
			is_active: datos.is_active ?? true,
			last_login_at: null,
			password_hash: passwordHash,
			created_at: marca,
			updated_at: marca,
			is_deleted: false
		});
		const tarjeta = datos.tarjeta ? tarjetaMock.crearAnidada(usuario.id, datos.tarjeta) : null;
		return { ...usuarioPublico(usuario), tarjeta: tarjeta ? tarjetaMock.completa(tarjeta) : null };
	});
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

	const fila = enTransaccion(() =>
		db.usuarios.actualizar(id, {
			...(datos.email !== undefined && { email: datos.email }),
			...(datos.rol !== undefined && { rol: datos.rol }),
			...(datos.is_active !== undefined && { is_active: datos.is_active }),
			updated_at: ahora()
		})
	);
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

export const usuarioMock = { obtener, listar, crear, actualizar, restablecerPassword, eliminar };

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
