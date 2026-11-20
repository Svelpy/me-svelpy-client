import { derived, get, writable } from 'svelte/store';
import { Role } from '#lib/config/permissions.config.ts';
import type {
	CurrentUser,
	LoginCredentials,
	RegistroRequest,
	TarjetaResumen,
	Usuario
} from '#lib/interfaces/index.ts';
import { AppError, authService } from '#lib/services/index.ts';
import { isRole } from '#lib/utils/rbac.utils.ts';
import { miTarjetaStore } from './miTarjeta.store';

// Usuario de la sesión (y el resumen de su tarjeta); persistido en localStorage por authService
export const currentUserStore = writable<CurrentUser | null>(authService.getCurrentUser());

export const isAuthenticated = derived(currentUserStore, ($user) => $user !== null);

// Rol del usuario actual; null sin sesión o si el rol no es uno conocido por el frontend
export const currentRole = derived(currentUserStore, ($user) => {
	const rol = $user?.user.rol;
	return isRole(rol) ? rol : null;
});

export const isLoading = writable<boolean>(false);

// true cuando el usuario ya se validó contra /users/me en esta carga de la app.
// Se pierde al recargar: así el rol siempre sale del servidor y no del localStorage (editable).
let isSessionVerified = false;

// El servidor rechazó la sesión: se sincroniza el store con el localStorage ya limpio
authService.onSessionExpired(() => {
	isSessionVerified = false;
	currentUserStore.set(null);
	miTarjetaStore.reiniciar();
});

export const authStore = {
	/**
	 * Inicia sesión y deja la sesión lista. Si es un owner, trae además TODA su tarjeta con una
	 * sola petición antes de entrar al panel.
	 */
	login: async (credentials: LoginCredentials) => {
		isLoading.set(true);
		try {
			const loginResponse = await authService.login(credentials);
			const userData = authService.getCurrentUser();
			if (userData) {
				currentUserStore.set(userData);
				isSessionVerified = true;
				if (userData.user.rol === Role.OWNER) await miTarjetaStore.cargar(true);
			}
			return loginResponse;
		} finally {
			isLoading.set(false);
		}
	},

	/** Registro propio: crea la cuenta y su tarjeta, entra y carga la tarjeta completa */
	registrar: async (datos: RegistroRequest) => {
		isLoading.set(true);
		try {
			const respuesta = await authService.registrar(datos);
			const userData = authService.getCurrentUser();
			if (userData) {
				currentUserStore.set(userData);
				isSessionVerified = true;
				await miTarjetaStore.cargar(true);
			}
			return respuesta;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Devuelve la sesión validada por el servidor, o null si no hay sesión válida.
	 * La primera llamada de cada carga de la app consulta /users/me; las siguientes usan el store.
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
			const userData = await authService.getMe();
			currentUserStore.set(userData);
			isSessionVerified = true;
			return userData;
		} catch (error) {
			// Token vencido o inválido: se cierra la sesión. Otros errores (red, 5xx) no la cierran
			if (error instanceof AppError && (error.status === 401 || error.status === 403)) {
				await authStore.logout();
				return null;
			}
			throw error;
		}
	},

	/** Vuelve a pedir /users/me (p. ej. tras crear la tarjeta) */
	refreshUser: async () => {
		try {
			const userData = await authService.getMe();
			currentUserStore.set(userData);
		} catch (error) {
			console.error('Error refreshing user data:', error);
		}
	},

	/** Reemplaza la sesión en el store y en localStorage */
	setUser: (userData: CurrentUser) => {
		currentUserStore.set(userData);
		authService.setCurrentUser(userData);
	},

	/** Reemplaza los datos del usuario de la sesión */
	setUserData: (user: Usuario) => {
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
		await authService.logout();
	},

	setLoading: (loading: boolean) => {
		isLoading.set(loading);
	}
};
