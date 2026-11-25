import { describe, expect, it } from 'vitest';
import { ErrorCode } from '#lib/interfaces/index.ts';
import { AppError, errorService, normalizarRutaCampo } from './error.service.ts';

const respuesta = (status: number, cuerpo: unknown) =>
	new Response(JSON.stringify(cuerpo), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});

describe('normalizarRutaCampo', () => {
	it('pasa las rutas de la API (con flechas) a puntos', () => {
		expect(normalizarRutaCampo('contactos -> 0 -> valor')).toBe('contactos.0.valor');
		expect(normalizarRutaCampo('items -> 2 -> categoria_id')).toBe('items.2.categoria_id');
		expect(normalizarRutaCampo('slug')).toBe('slug');
		expect(normalizarRutaCampo('tarjeta.slug')).toBe('tarjeta.slug');
	});
});

describe('errorService.fromResponse', () => {
	it('lee el formato de la API y normaliza los campos de details', async () => {
		const error = await errorService.fromResponse(
			respuesta(422, {
				status: 'fail',
				code: 'VALIDATION_ERROR',
				message: 'Los datos enviados no son válidos.',
				details: {
					slug: 'Ya está en uso.',
					'contactos -> 0 -> valor': 'El teléfono no tiene un formato válido.'
				}
			})
		);
		expect(error).toBeInstanceOf(AppError);
		expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
		expect(errorService.getFieldErrors(error)).toEqual({
			slug: 'Ya está en uso.',
			'contactos.0.valor': 'El teléfono no tiene un formato válido.'
		});
		expect(errorService.getMessage(error)).toBe('Los datos enviados no son válidos.');
	});

	it('convierte los errores de validación de FastAPI en errores por campo', async () => {
		const error = await errorService.fromResponse(
			respuesta(422, {
				detail: [{ loc: ['body', 'tarjeta', 'slug'], msg: 'String too short', type: 'x' }]
			})
		);
		expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
		expect(errorService.getFieldErrors(error)).toEqual({ 'tarjeta.slug': 'String too short' });
	});

	it('un 429 sin formato es "demasiados intentos"', async () => {
		const error = await errorService.fromResponse(new Response('', { status: 429 }));
		expect(error.code).toBe(ErrorCode.RATE_LIMITED);
		expect(errorService.getMessage(error)).toMatch(/demasiados intentos/);
	});

	it('nunca muestra el mensaje crudo de un 5xx', async () => {
		const error = await errorService.fromResponse(
			respuesta(500, { status: 'error', code: 'INTERNAL_ERROR', message: 'Traceback…' })
		);
		expect(errorService.getMessage(error)).not.toContain('Traceback');
	});
});
