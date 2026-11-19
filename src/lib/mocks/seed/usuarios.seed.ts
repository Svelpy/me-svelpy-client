import { Role, type AssignableUserRole } from '#lib/config/permissions.config.ts';
import type { TarjetaNuevaRequest } from '#lib/interfaces/index.ts';
import {
	tarjetaLucia,
	tarjetaDiego,
	tarjetaMartin,
	tarjetaPaola,
	tarjetaRodrigo
} from './tarjetas/creativos.seed';
import {
	tarjetaAndres,
	tarjetaJorge,
	tarjetaMariana,
	tarjetaValeria
} from './tarjetas/empresas.seed';
import { tarjetaAndrea, tarjetaCamila, tarjetaFabiola } from './tarjetas/salud.seed';

/**
 * Cuentas de prueba para iniciar sesión. Cada una se crea con `POST /usuarios` (con su tarjeta
 * anidada), igual que lo haría el superadmin desde el panel.
 */

export interface CuentaDePrueba {
	email: string;
	password: string;
	rol: AssignableUserRole;
	is_active?: boolean;
	/** Qué permite probar, para la lista del login */
	descripcion: string;
	tarjeta?: TarjetaNuevaRequest;
}

const PASSWORD_OWNER = 'Demo1234';

export const CUENTAS_DE_PRUEBA: CuentaDePrueba[] = [
	{
		email: 'superadmin@me.test',
		password: 'Admin1234',
		rol: Role.SUPERADMIN,
		descripcion: 'Superadministrador'
	},
	{
		email: 'fabiola@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Pediatra en Santa Cruz',
		tarjeta: tarjetaFabiola
	},
	{
		email: 'camila@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Odontóloga',
		tarjeta: tarjetaCamila
	},
	{
		email: 'valeria@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Agente inmobiliaria',
		tarjeta: tarjetaValeria
	},
	{
		email: 'andres@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Gerente comercial de logística',
		tarjeta: tarjetaAndres
	},
	{
		email: 'mariana@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Abogada corporativa',
		tarjeta: tarjetaMariana
	},
	{
		email: 'rodrigo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Chef de restaurante',
		tarjeta: tarjetaRodrigo
	},
	{
		email: 'lucia@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Fotógrafa de bodas',
		tarjeta: tarjetaLucia
	},
	{
		email: 'andrea@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Psicóloga clínica',
		tarjeta: tarjetaAndrea
	},
	{
		email: 'martin@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Arquitecto',
		tarjeta: tarjetaMartin
	},
	{
		email: 'diego@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Entrenador personal',
		tarjeta: tarjetaDiego
	},
	{
		email: 'paola@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Estilista, tarjeta en borrador',
		tarjeta: tarjetaPaola
	},
	{
		email: 'nuevo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Propietario que aún no tiene tarjeta'
	},
	{
		email: 'inactivo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		is_active: false,
		descripcion: 'Cuenta desactivada: no puede entrar',
		tarjeta: tarjetaJorge
	}
];
