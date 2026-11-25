import { describe, expect, it, vi } from 'vitest';
import { AppError } from '#lib/services/index.ts';
import { API_CONFIG, conQuery } from './api.config.ts';
import { apiMeSvelpy } from './apiMeSvelpy.config.ts';

const json = (status: number, cuerpo: unknown) =>
	new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

describe('apiMeSvelpy', () => {
	it('una respuesta sin cuerpo (201 del registro, 204) no rompe: devuelve undefined', async () => {
		const fetch = vi.fn(async () => new Response(null, { status: 201 }));
		await expect(apiMeSvelpy.postPublic('/auth/register', {}, { fetch })).resolves.toBeUndefined();
		const vacio = vi.fn(async () => new Response(null, { status: 204 }));
		await expect(
			apiMeSvelpy.postPublic('/auth/logout', undefined, { fetch: vacio })
		).resolves.toBeUndefined();
	});

	it('usa el fetch que se le pasa (el del load, para el SSR) y la URL base', async () => {
		const fetch = vi.fn(async () => json(200, { slug: 'ana', disponible: true }));
		const respuesta = await apiMeSvelpy.getPublic('/tarjetas/public/slug-disponible/ana', {
			fetch
		});
		expect(respuesta).toEqual({ slug: 'ana', disponible: true });
		expect(fetch).toHaveBeenCalledWith(
			`${API_CONFIG.BASE_URL}/tarjetas/public/slug-disponible/ana`,
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('envía JSON salvo FormData, que lleva su propio Content-Type', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>(async () => json(200, {}));
		await apiMeSvelpy.postPublic('/auth/login', { email: 'a@b.com' }, { fetch });
		const [, conJson] = fetch.mock.calls[0];
		expect(conJson?.body).toBe('{"email":"a@b.com"}');
		expect((conJson?.headers as Record<string, string>)['Content-Type']).toBe('application/json');

		await apiMeSvelpy.postPublic('/imagenes/uploads', new FormData(), { fetch });
		const [, conArchivo] = fetch.mock.calls[1];
		expect(conArchivo?.headers as Record<string, string>).not.toHaveProperty('Content-Type');
	});

	it('los errores llegan como AppError con el mensaje de la API', async () => {
		const fetch = vi.fn(async () =>
			json(409, { status: 'fail', code: 'CONFLICT', message: 'El slug ya está en uso.' })
		);
		const error: AppError = (await apiMeSvelpy
			.postPublic('/auth/register', {}, { fetch })
			.catch((e: AppError) => e)) as AppError;
		expect(error).toBeInstanceOf(AppError);
		expect(error.status).toBe(409);
		expect(error.message).toBe('El slug ya está en uso.');
	});
});

describe('conQuery', () => {
	it('agrega solo los parámetros con valor', () => {
		expect(conQuery('/tarjetas/', { page: 2, is_public: false, user_id: undefined, q: '' })).toBe(
			'/tarjetas/?page=2&is_public=false'
		);
		expect(conQuery('/planes/', {})).toBe('/planes/');
	});
});
