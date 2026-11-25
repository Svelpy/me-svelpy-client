import { Action, Module, Role } from '#lib/config/permissions.config.ts';
import type { Usuario } from '#lib/interfaces/index.ts';
import { can, puedeGestionarCuenta } from '#lib/utils/rbac.utils.ts';

/** Qué puede hacer el actor con una cuenta (lo mismo que exige el backend) */
export interface AccionesCuenta {
	/** Email y rol */
	editar: boolean;
	/** Solo las cuentas user tienen plan que renovar */
	registrarPago: boolean;
	/** Enviarle el enlace para crear una contraseña nueva */
	enlacePassword: boolean;
	darDeBaja: boolean;
	reactivar: boolean;
	/** Solo el superadmin elimina */
	eliminar: boolean;
	/** Crear su tarjeta (si aún no tiene) */
	crearTarjeta: boolean;
}

/**
 * Las acciones sobre una cuenta según el rol de quien la mira: solo se gestionan cuentas de rango
 * menor y nunca la propia (la propia se edita en "Mi cuenta").
 */
export function accionesDeCuenta(
	actor: Role | null,
	cuenta: Pick<Usuario, 'id' | 'rol' | 'is_active'>,
	miId: string | undefined
): AccionesCuenta {
	const gestionable = cuenta.id !== miId && puedeGestionarCuenta(actor, cuenta.rol);
	const esUser = cuenta.rol === Role.USER;
	return {
		editar: gestionable,
		registrarPago: esUser && can(actor, Module.PAGO, Action.CREATE),
		enlacePassword: gestionable,
		darDeBaja: gestionable && cuenta.is_active,
		reactivar: gestionable && !cuenta.is_active,
		eliminar: gestionable && can(actor, Module.USUARIO, Action.DELETE),
		crearTarjeta: esUser && cuenta.is_active && can(actor, Module.TARJETA, Action.CREATE)
	};
}
