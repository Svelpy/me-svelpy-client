import { beforeEach, describe, expect, it, vi } from 'vitest';

// localStorage en memoria antes de importar nada: lo usan authService y la base de prueba
vi.hoisted(() => {
	const datos = new Map<string, string>();
	const almacen = {
		getItem: (clave: string) => datos.get(clave) ?? null,
		setItem: (clave: string, valor: string) => void datos.set(clave, String(valor)),
		removeItem: (clave: string) => void datos.delete(clave),
		clear: () => datos.clear(),
		key: (indice: number) => [...datos.keys()][indice] ?? null,
		get length() {
			return datos.size;
		}
	};
	Object.defineProperty(globalThis, 'localStorage', { value: almacen, configurable: true });
});

import { get } from 'svelte/store';
import { AppError } from '#lib/services/error.service.ts';
import { authStore, miTarjetaStore } from '#lib/stores/index.ts';
import type { Sesion } from './db/contexto';
import { db } from './db/tablas';
import { mockHttp } from './http.mock';
import { buscarRuta } from './router';
import { restablecerDatosDePrueba } from './seed';
import { tarjetaFabiola } from './seed/tarjetas/salud.seed';

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function sesionDe(email: string): Sesion {
	const usuario = db.usuarios.activas().find((u) => u.email === email);
	if (!usuario) throw new Error(`Sin cuenta ${email}`);
	return { usuario, token: 'token-de-prueba' };
}

/** Llama a una ruta del backend simulado como lo haría el cliente HTTP */
async function llamar<T = unknown>(
	metodo: Metodo,
	ruta: string,
	opciones: { sesion?: Sesion | null; cuerpo?: unknown } = {}
): Promise<T> {
	const url = new URL(ruta, 'http://me.mock');
	const encontrada = buscarRuta(metodo, url.pathname);
	if (!encontrada) throw new Error(`Ruta inexistente: ${metodo} ${ruta}`);
	const resultado = await encontrada.ruta.manejar({
		params: encontrada.params,
		query: url.searchParams,
		cuerpo: opciones.cuerpo,
		sesion: opciones.sesion ?? null
	});
	return structuredClone(resultado) as T;
}

async function errorDe(promesa: Promise<unknown>): Promise<AppError> {
	try {
		await promesa;
	} catch (error) {
		if (error instanceof AppError) return error;
		throw error;
	}
	throw new Error('Se esperaba un error');
}

const tarjetaDe = (email: string) => {
	const usuario = db.usuarios.todas().find((u) => u.email === email)!;
	return db.tarjetas.todas().find((t) => t.user_id === usuario.id)!;
};

beforeEach(async () => {
	localStorage.clear();
	await restablecerDatosDePrueba();
});

describe('Datos de prueba', () => {
	it('siembra las cuentas y sus tarjetas validadas por el mismo backend', () => {
		expect(db.usuarios.activas()).toHaveLength(14);
		expect(db.tarjetas.activas()).toHaveLength(12);
		const fabiola = tarjetaDe('fabiola@me.test');
		expect(db.secciones.donde((s) => s.tarjeta_id === fabiola.id)).toHaveLength(9);
		expect(db.temas.donde((t) => t.tarjeta_id === fabiola.id)[0]).toMatchObject({
			preset: 'salud',
			tipografia: 4
		});
	});
});

describe('POST /usuarios', () => {
	const admin = () => sesionDe('superadmin@me.test');

	it('crea la cuenta con su tarjeta, contactos, redes y vitrina en una sola petición', async () => {
		const respuesta = await llamar<{
			id: string;
			tarjeta: {
				slug: string;
				secciones: unknown[];
				contactos: unknown[];
				vitrina: { items: unknown[] };
				theme: { preset: string };
			};
		}>('POST', '/usuarios', {
			sesion: admin(),
			cuerpo: {
				email: 'Nueva@Me.Test',
				password: 'Clave1234',
				rol: 'OWNER',
				tarjeta: {
					...tarjetaFabiola,
					slug: 'dra-nueva',
					rubro: 'Odontología',
					theme: undefined
				}
			}
		});
		expect(db.usuarios.buscar(respuesta.id)?.email).toBe('nueva@me.test');
		expect(respuesta.tarjeta.slug).toBe('dra-nueva');
		expect(respuesta.tarjeta.secciones).toHaveLength(9);
		expect(respuesta.tarjeta.contactos).toHaveLength(4);
		expect(respuesta.tarjeta.vitrina.items).toHaveLength(4);
		// Sin tema en el cuerpo: el preset que sugiere el rubro
		expect(respuesta.tarjeta.theme.preset).toBe('salud');
	});

	it('si un dato anidado es inválido no guarda nada', async () => {
		const usuariosAntes = db.usuarios.todas().length;
		const error = await errorDe(
			llamar('POST', '/usuarios', {
				sesion: admin(),
				cuerpo: {
					email: 'rollback@me.test',
					password: 'Clave1234',
					rol: 'OWNER',
					tarjeta: {
						slug: 'rollback',
						rubro: 'Odontología',
						nombres: 'Prueba',
						contactos: [{ tipo: 'email', valor: 'esto-no-es-un-correo' }]
					}
				}
			})
		);
		expect(error.status).toBe(422);
		expect(error.details).toHaveProperty(['tarjeta.contactos.0.valor']);
		expect(db.usuarios.todas()).toHaveLength(usuariosAntes);
		expect(db.tarjetas.todas().some((t) => t.slug === 'rollback')).toBe(false);
	});

	it('responde 409 con el email o el slug repetidos', async () => {
		const email = await errorDe(
			llamar('POST', '/usuarios', {
				sesion: admin(),
				cuerpo: { email: 'fabiola@me.test', password: 'Clave1234', rol: 'OWNER' }
			})
		);
		expect(email.status).toBe(409);
		expect(email.details).toHaveProperty('email');

		const slug = await errorDe(
			llamar('POST', '/usuarios', {
				sesion: admin(),
				cuerpo: {
					email: 'otra@me.test',
					password: 'Clave1234',
					rol: 'OWNER',
					tarjeta: { slug: 'doctora-fabiola', rubro: 'Pediatría', nombres: 'Otra' }
				}
			})
		);
		expect(slug.status).toBe(409);
		expect(String(slug.details.slug)).toContain('doctora-fabiola-2');
	});

	it('un owner no puede listar ni crear cuentas', async () => {
		const owner = sesionDe('fabiola@me.test');
		expect((await errorDe(llamar('GET', '/usuarios', { sesion: owner }))).status).toBe(403);
		expect((await errorDe(llamar('GET', '/tarjetas', { sesion: owner }))).status).toBe(403);
	});
});

describe('Borrado lógico', () => {
	it('eliminar una cuenta marca is_deleted en ella, su tarjeta y su contenido', async () => {
		const tarjeta = tarjetaDe('camila@me.test');
		const usuarioId = tarjeta.user_id;
		await llamar('DELETE', `/usuarios/${usuarioId}`, { sesion: sesionDe('superadmin@me.test') });

		expect(db.usuarios.todas().find((u) => u.id === usuarioId)?.is_deleted).toBe(true);
		expect(db.tarjetas.todas().find((t) => t.id === tarjeta.id)?.is_deleted).toBe(true);
		expect(
			db.contactos
				.todas()
				.filter((c) => c.tarjeta_id === tarjeta.id)
				.every((c) => c.is_deleted)
		).toBe(true);
		expect(db.contactos.donde((c) => c.tarjeta_id === tarjeta.id)).toHaveLength(0);

		const publica = await errorDe(llamar('GET', '/public/tarjetas/dra-camila-rivas'));
		expect(publica.status).toBe(404);
	});

	it('el slug de una tarjeta eliminada sigue reservado', async () => {
		const tarjeta = tarjetaDe('camila@me.test');
		await llamar('DELETE', `/tarjetas/${tarjeta.id}`, { sesion: sesionDe('superadmin@me.test') });
		const disponibilidad = await llamar<{ disponible: boolean }>(
			'GET',
			'/tarjetas/slug-disponible?slug=dra-camila-rivas',
			{ sesion: sesionDe('superadmin@me.test') }
		);
		expect(disponibilidad.disponible).toBe(false);
	});
});

describe('Pertenencia y permisos del owner', () => {
	it('no puede tocar la tarjeta de otra persona', async () => {
		const ajena = tarjetaDe('camila@me.test');
		const contacto = db.contactos.donde((c) => c.tarjeta_id === ajena.id)[0];
		const error = await errorDe(
			llamar('PATCH', `/contactos/${contacto.id}`, {
				sesion: sesionDe('fabiola@me.test'),
				cuerpo: { valor: '+591 70000000' }
			})
		);
		expect(error.status).toBe(403);
	});

	it('edita su tarjeta pero no cambia su slug; el superadmin sí', async () => {
		const propia = tarjetaDe('fabiola@me.test');
		const owner = sesionDe('fabiola@me.test');
		const editada = await llamar<{ cargo: string }>('PATCH', `/tarjetas/${propia.id}`, {
			sesion: owner,
			cuerpo: { cargo: 'Pediatra' }
		});
		expect(editada.cargo).toBe('Pediatra');

		const slugOwner = await errorDe(
			llamar('PATCH', `/tarjetas/${propia.id}`, { sesion: owner, cuerpo: { slug: 'fabiola' } })
		);
		expect(slugOwner.status).toBe(403);

		const slugAdmin = await llamar<{ slug: string }>('PATCH', `/tarjetas/${propia.id}`, {
			sesion: sesionDe('superadmin@me.test'),
			cuerpo: { slug: 'dra-fabiola-mendoza' }
		});
		expect(slugAdmin.slug).toBe('dra-fabiola-mendoza');
	});

	it('un contacto principal desmarca al anterior del mismo tipo', async () => {
		const propia = tarjetaDe('fabiola@me.test');
		const nuevo = await llamar<{ id: string }>('POST', `/tarjetas/${propia.id}/contactos`, {
			sesion: sesionDe('fabiola@me.test'),
			cuerpo: { tipo: 'phone', valor: '+591 71111111', is_primary: true }
		});
		const principales = db.contactos.donde(
			(c) => c.tarjeta_id === propia.id && c.tipo === 'phone' && c.is_primary
		);
		expect(principales.map((c) => c.id)).toEqual([nuevo.id]);
	});
});

describe('Tarjeta pública', () => {
	it('muestra solo lo visible y vacía las secciones ocultas', async () => {
		const propia = tarjetaDe('fabiola@me.test');
		const owner = sesionDe('fabiola@me.test');
		const secciones = await llamar<
			{ clave: string; titulo: string | null; is_visible: boolean; orden: number }[]
		>('GET', `/tarjetas/${propia.id}/secciones`, { sesion: owner });
		await llamar('PUT', `/tarjetas/${propia.id}/secciones`, {
			sesion: owner,
			cuerpo: {
				secciones: secciones.map((s) => ({ ...s, is_visible: s.clave !== 'faq' }))
			}
		});

		const publica = await llamar<{ faq: unknown[]; educacion: unknown[]; propietario?: unknown }>(
			'GET',
			'/public/tarjetas/doctora-fabiola'
		);
		expect(publica.faq).toHaveLength(0);
		expect(publica.educacion).toHaveLength(3);
		expect(publica).not.toHaveProperty('propietario');
	});

	it('responde 404 a un borrador y a la tarjeta de una cuenta desactivada', async () => {
		expect((await errorDe(llamar('GET', '/public/tarjetas/paola-estilista'))).status).toBe(404);
		expect((await errorDe(llamar('GET', '/public/tarjetas/jorge-mamani-contador'))).status).toBe(
			404
		);
		expect((await errorDe(llamar('GET', '/public/tarjetas/no-existe'))).status).toBe(404);
	});
});

describe('Login', () => {
	it('un owner recibe toda su tarjeta con una sola petición', async () => {
		const espia = vi.spyOn(mockHttp, 'get');
		await authStore.login({ email: 'fabiola@me.test', password: 'Demo1234' });

		const pedidasDeTarjeta = espia.mock.calls.filter(([ruta]) =>
			String(ruta).startsWith('/tarjetas')
		);
		expect(pedidasDeTarjeta.map(([ruta]) => ruta)).toEqual(['/tarjetas/mia']);
		const estado = get(miTarjetaStore);
		expect(estado.estado).toBe('lista');
		expect(estado.tarjeta?.slug).toBe('doctora-fabiola');
		expect(estado.tarjeta?.ubicaciones[0].horarios.length).toBeGreaterThan(0);
		espia.mockRestore();
		await authStore.logout();
	});

	it('rechaza contraseñas incorrectas y cuentas desactivadas', async () => {
		const incorrecta = await errorDe(
			authStore.login({ email: 'fabiola@me.test', password: 'mala' })
		);
		expect(incorrecta.status).toBe(401);
		const inactiva = await errorDe(
			authStore.login({ email: 'inactivo@me.test', password: 'Demo1234' })
		);
		expect(inactiva.status).toBe(403);
	});
});
