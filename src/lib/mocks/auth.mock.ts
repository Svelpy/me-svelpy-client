import { ErrorCode } from '#lib/interfaces/error.interface.ts';
import type { CurrentUser } from '#lib/interfaces/index.ts';
import { AppError } from '#lib/services/error.service.ts';
import { cambiarPasswordRequestSchema } from '#lib/zod/auth.schema.ts';
import { ahora, error, exigirSesion, validar, type RutaMock } from './db/contexto';
import {
	cerrarSesion,
	cerrarSesionesDe,
	crearSesion,
	hashPassword,
	leerTokenGuardado,
	sesionDesdeToken,
	verificarPassword
} from './db/sesion';
import { db } from './db/tablas';
import { resumenTarjeta, tarjetaMock } from './modelos/tarjeta.mock';
import { usuarioMock, usuarioPublico } from './modelos/usuario.mock';

/** Rutas de autenticación del backend simulado (login, refresh, logout, /users/me) */

export const authRutas: RutaMock[] = [
	{
		metodo: 'POST',
		patron: '/auth/login',
		publica: true,
		// OAuth2 password flow: el correo llega en `username`
		manejar: async (ctx) => {
			const cuerpo = (ctx.cuerpo ?? {}) as Record<string, unknown>;
			const email = String(cuerpo.username ?? '')
				.trim()
				.toLowerCase();
			const password = String(cuerpo.password ?? '');
			if (!email || !password) {
				throw error.validacion({
					...(!email && { email: 'Ingresa un correo.' }),
					...(!password && { password: 'Ingresa tu contraseña.' })
				});
			}
			const usuario = db.usuarios.activas().find((u) => u.email === email);
			if (!usuario || !(await verificarPassword(password, usuario.password_hash))) {
				throw new AppError({
					message: 'El correo o la contraseña no son correctos.',
					code: ErrorCode.AUTHENTICATION_FAILED,
					status: 401
				});
			}
			if (!usuario.is_active) {
				throw new AppError({
					message: 'Tu cuenta está desactivada. Escríbenos por WhatsApp para reactivarla.',
					code: ErrorCode.PERMISSION_DENIED,
					status: 403
				});
			}
			db.usuarios.actualizar(usuario.id, { last_login_at: ahora() });
			return crearSesion(usuario.id);
		}
	},
	{
		// Registro propio: cuenta + tarjeta en borrador, y queda con la sesión abierta
		metodo: 'POST',
		patron: '/auth/registro',
		publica: true,
		manejar: async (ctx) => {
			const cuenta = await usuarioMock.registrar(ctx.cuerpo);
			db.usuarios.actualizar(cuenta.id, { last_login_at: ahora() });
			return crearSesion(cuenta.id);
		}
	},
	{
		metodo: 'POST',
		patron: '/auth/refresh',
		publica: true,
		manejar: () => {
			const token = leerTokenGuardado();
			const fila = token ? db.sesiones.buscar(token) : undefined;
			if (!token || !fila || !sesionDesdeToken(token)) {
				throw new AppError({
					message: 'Tu sesión expiró. Inicia sesión nuevamente.',
					code: ErrorCode.REFRESH_FAILED,
					status: 401
				});
			}
			return { access_token: token, csrf_token: fila.csrf_token, token_type: 'bearer' };
		}
	},
	{
		metodo: 'POST',
		patron: '/auth/logout',
		publica: true,
		manejar: () => {
			const token = leerTokenGuardado();
			if (token) cerrarSesion(token);
			return {};
		}
	},
	{
		metodo: 'GET',
		patron: '/users/me',
		manejar: (ctx): CurrentUser => {
			const sesion = exigirSesion(ctx);
			const tarjeta = tarjetaMock.deUsuario(sesion.usuario.id);
			return {
				user: usuarioPublico(sesion.usuario),
				tarjeta: tarjeta ? resumenTarjeta(tarjeta) : null
			};
		}
	},
	{
		metodo: 'PATCH',
		patron: '/users/me/password',
		manejar: async (ctx) => {
			const sesion = exigirSesion(ctx);
			const datos = validar(cambiarPasswordRequestSchema, ctx.cuerpo);
			if (!(await verificarPassword(datos.password_actual, sesion.usuario.password_hash))) {
				throw error.validacion({ password_actual: 'La contraseña actual no es correcta.' });
			}
			const passwordHash = await hashPassword(datos.password_nueva);
			db.usuarios.actualizar(sesion.usuario.id, {
				password_hash: passwordHash,
				updated_at: ahora()
			});
			cerrarSesionesDe(sesion.usuario.id, sesion.token);
			return {};
		}
	}
];
