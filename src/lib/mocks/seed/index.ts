import { Role } from '#lib/config/permissions.config.ts';
import { borrarTodo, guardarValor, leerValor } from '../db/storage';
import { db } from '../db/tablas';
import { usuarioMock } from '../modelos/usuario.mock';
import { CUENTAS_DE_PRUEBA } from './usuarios.seed';

/**
 * Siembra la base de prueba la primera vez (o cuando cambia `VERSION_DATOS`). Todo pasa por
 * `usuarioMock.crear`, así los datos de prueba se validan igual que lo que se crea desde el panel.
 */

/** Subir al cambiar los datos de prueba: cada navegador vuelve a sembrar su base */
const VERSION_DATOS = '2';

let preparacion: Promise<void> | null = null;

async function sembrar(): Promise<void> {
	if (leerValor('version') === VERSION_DATOS) return;
	borrarTodo();
	for (const cuenta of CUENTAS_DE_PRUEBA) {
		await usuarioMock.crear({
			email: cuenta.email,
			password: cuenta.password,
			rol: cuenta.rol,
			is_active: cuenta.is_active ?? true,
			...(cuenta.tarjeta && { tarjeta: cuenta.tarjeta })
		});
	}
	// Fechas escalonadas: así "Actualizadas hace poco" y "Último acceso" tienen sentido
	const ahora = Date.now();
	const haceHoras = (horas: number) => new Date(ahora - horas * 3_600_000).toISOString();
	const tarjetas = db.tarjetas.activas();
	tarjetas.forEach((tarjeta, indice) => {
		db.tarjetas.actualizar(tarjeta.id, { updated_at: haceHoras(indice * 7) });
	});
	// Cada propietario con tarjeta entró alguna vez; sin tarjeta o desactivada queda en "Nunca"
	const HORAS_DESDE_EL_ACCESO = [2, 7, 26, 33, 51, 76, 99, 170, 245, 342, 510];
	db.usuarios
		.activas()
		.filter((u) => u.is_active && u.rol === Role.OWNER && tarjetas.some((t) => t.user_id === u.id))
		.forEach((usuario, indice) => {
			db.usuarios.actualizar(usuario.id, {
				last_login_at: haceHoras(HORAS_DESDE_EL_ACCESO[indice % HORAS_DESDE_EL_ACCESO.length])
			});
		});
	guardarValor('version', VERSION_DATOS);
}

/** Deja la base lista antes de la primera petición; las siguientes no esperan */
export function prepararDatosDePrueba(): Promise<void> {
	preparacion ??= sembrar().catch((causa) => {
		preparacion = null;
		throw causa;
	});
	return preparacion;
}

/** Borra todo lo guardado (también lo creado desde el panel) y vuelve a sembrar */
export async function restablecerDatosDePrueba(): Promise<void> {
	preparacion = null;
	borrarTodo();
	await prepararDatosDePrueba();
}
