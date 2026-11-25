import { derived, get, writable } from 'svelte/store';
import { ErrorCode } from '#lib/interfaces/index.ts';
import type {
	CurrentUser,
	LoginCredentials,
	RegistroRequest,
	TarjetaResumen,
	UsuarioDetalle,
	UsuarioMe
} from '#lib/interfaces/index.ts';
import { AppError, authService, usuarioService } from '#lib/services/index.ts';
import { isRole } from '#lib/utils/rbac.utils.ts';
import { resumenDeTarjeta } from '#lib/utils/tarjeta.ts';
import { miTarjetaStore } from './miTarjeta.store';
import { planesStore } from './planes.store';

// Usuario de la sesión (y el resumen de su tarjeta); persistido en localStorage por authService
export const currentUserStore = writable<CurrentUser | null>(authService.getCurrentUser());

export const isAuthenticated = derived(currentUserStore, ($user) => $user !== null);

// Rol del usuario actual; null sin sesión o si el rol no es uno conocido por el frontend
export const currentRole = derived(currentUserStore, ($user) => {
	const rol = $user?.user.rol;
	return isRole(rol) ? rol : null;
});

export const isLoading = writable<boolean>(false);

// true cuando el usuario ya se validó contra /usuarios/me en esta carga de la app.
// Se pierde al recargar: así el rol siempre sale del servidor y no del localStorage (editable).
let isSessionVerified = false;

// El servidor rechazó la sesión: se sincroniza el store con el localStorage ya limpio
authService.onSessionExpired(() => {
	isSessionVerified = false;
	currentUserStore.set(null);
	miTarjetaStore.reiniciar();
	planesStore.reiniciar();
});

/** Reparte la respuesta de `/usuarios/me`: el usuario a la sesión y la tarjeta completa a su store */
function aplicarMe(me: UsuarioMe): CurrentUser {
	const { tarjeta, ...user } = me;
	const sesion: CurrentUser = { user, tarjeta: tarjeta ? resumenDeTarjeta(tarjeta) : null };
	authService.setCurrentUser(sesion);
	currentUserStore.set(sesion);
	miTarjetaStore.establecer(tarjeta);
	isSessionVerified = true;
	return sesion;
}

export const authStore = {
	/**
	 * Inicia sesión y deja todo listo con una sola petición más (`GET /usuarios/me`): el usuario,
	 * su plan y, si es un user, su tarjeta completa.
	 */
	login: async (credentials: LoginCredentials): Promise<CurrentUser> => {
		isLoading.set(true);
		try {
			await authService.login(credentials);
			try {
				return aplicarMe(await usuarioService.me());
			} catch (error) {
				await authService.logout();
				throw error;
			}
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Registro propio: crea la cuenta y su tarjeta (`POST /auth/register`, que no inicia sesión) y
	 * entra con las mismas credenciales.
	 */
	registrar: async (datos: RegistroRequest): Promise<CurrentUser> => {
		isLoading.set(true);
		try {
			await authService.registrar(datos);
		} finally {
			isLoading.set(false);
		}
		try {
			return await authStore.login({ email: datos.email, password: datos.password });
		} catch (error) {
			// La cuenta ya existe: que no vuelva a registrarse, sino a entrar
			throw new AppError({
				message:
					'Tu cuenta quedó creada, pero no pudimos abrir la sesión. Inicia sesión con tu correo y tu contraseña.',
				code: ErrorCode.APP_ERROR,
				status: 400,
				cause: error
			});
		}
	},

	/**
	 * Devuelve la sesión validada por el servidor, o null si no hay sesión válida.
	 * La primera llamada de cada carga de la app consulta /usuarios/me; las siguientes usan el store.
	 */
	ensureSession: async (): Promise<CurrentUser | null> => {
		// Sin token (logout o 401 de la API, que lo borra) no hay sesión
		if (!authService.getToken()) {
			isSessionVerified = false;
			currentUserStore.set(null);
			return null;
		}

		if (isSessionVerified) return get(currentUserStore);

		try {
			return aplicarMe(await usuarioService.me());
		} catch (error) {
			// Token vencido o inválido: se cierra la sesión. Otros errores (red, 5xx) no la cierran
			if (error instanceof AppError && (error.status === 401 || error.status === 403)) {
				await authStore.logout();
				return null;
			}
			throw error;
		}
	},

	/** Vuelve a pedir /usuarios/me (p. ej. tras verificar el email o crear la tarjeta) */
	refreshUser: async (): Promise<CurrentUser | null> => {
		if (!authService.getToken()) return null;
		return aplicarMe(await usuarioService.me());
	},

	/** Reemplaza la sesión en el store y en localStorage */
	setUser: (userData: CurrentUser) => {
		currentUserStore.set(userData);
		authService.setCurrentUser(userData);
	},

	/** Reemplaza los datos del usuario de la sesión (p. ej. tras cambiar el email) */
	setUserData: (user: UsuarioDetalle) => {
		const current = get(currentUserStore);
		if (!current) return;
		authStore.setUser({ ...current, user });
	},

	/** Actualiza el resumen de la tarjeta de la sesión (nombre, foto y estado en el header) */
	setTarjeta: (tarjeta: TarjetaResumen | null) => {
		const current = get(currentUserStore);
		if (!current) return;
		authStore.setUser({ ...current, tarjeta });
	},

	/** Cierra la sesión (en el servidor y local) y olvida la tarjeta cargada */
	logout: async () => {
		isSessionVerified = false;
		currentUserStore.set(null);
		miTarjetaStore.reiniciar();
		planesStore.reiniciar();
		await authService.logout();
	},

	setLoading: (loading: boolean) => {
		isLoading.set(loading);
	}
};
