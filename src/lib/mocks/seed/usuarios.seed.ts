import { Role, type AssignableUserRole } from '#lib/config/permissions.config.ts';
import { Plan } from '#lib/config/planes.config.ts';
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
	/** Por defecto free. Solo con pro la tarjeta puede nacer publicada */
	plan?: Plan;
	/** Días desde la siembra hasta que vence el pro; null u omitido = no vence */
	venceEnDias?: number | null;
	/** Qué permite probar, para la lista del login */
	descripcion: string;
	tarjeta?: TarjetaNuevaRequest;
}

const PASSWORD_OWNER = 'Demo1234';

export const CUENTAS_DE_PRUEBA: CuentaDePrueba[] = [
	// La usan las pruebas E2E y las de la API simulada
	{
		email: 'superadmin@me.test',
		password: 'Admin1234',
		rol: Role.SUPERADMIN,
		descripcion: 'Superadministrador de prueba'
	},
	{
		email: 'luis111ferrivera@gmail.com',
		password: '12345678',
		rol: Role.SUPERADMIN,
		descripcion: 'Superadministrador'
	},
	{
		email: 'bgonsalescoronado@gmail.com',
		password: '12345678',
		rol: Role.SUPERADMIN,
		descripcion: 'Superadministrador'
	},
	{
		email: 'pardotupav@gmail.com',
		password: '12345678',
		rol: Role.SUPERADMIN,
		descripcion: 'Superadministrador'
	},
	{
		email: 'fabiola@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 210,
		descripcion: 'Pediatra en Santa Cruz',
		tarjeta: tarjetaFabiola
	},
	{
		email: 'camila@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: null,
		descripcion: 'Odontóloga',
		tarjeta: tarjetaCamila
	},
	{
		email: 'valeria@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 95,
		descripcion: 'Agente inmobiliaria',
		tarjeta: tarjetaValeria
	},
	{
		email: 'andres@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 160,
		descripcion: 'Gerente comercial de logística',
		tarjeta: tarjetaAndres
	},
	{
		email: 'mariana@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: null,
		descripcion: 'Abogada corporativa',
		tarjeta: tarjetaMariana
	},
	{
		email: 'rodrigo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 40,
		descripcion: 'Chef de restaurante',
		tarjeta: tarjetaRodrigo
	},
	{
		email: 'lucia@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 300,
		descripcion: 'Fotógrafa de bodas',
		tarjeta: tarjetaLucia
	},
	{
		email: 'andrea@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 9,
		descripcion: 'Psicóloga clínica, su plan Pro vence en 9 días',
		tarjeta: tarjetaAndrea
	},
	{
		email: 'martin@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 120,
		descripcion: 'Arquitecto',
		tarjeta: tarjetaMartin
	},
	{
		email: 'diego@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 70,
		descripcion: 'Entrenador personal',
		tarjeta: tarjetaDiego
	},
	{
		email: 'paola@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Estilista con plan Free: no puede publicar',
		tarjeta: tarjetaPaola
	},
	{
		email: 'nuevo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		descripcion: 'Plan Free, aún sin tarjeta'
	},
	{
		email: 'inactivo@me.test',
		password: PASSWORD_OWNER,
		rol: Role.OWNER,
		plan: Plan.PRO,
		venceEnDias: 30,
		is_active: false,
		descripcion: 'Cuenta desactivada: no puede entrar',
		tarjeta: tarjetaJorge
	}
];
