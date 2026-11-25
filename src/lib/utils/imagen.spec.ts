import { describe, expect, it } from 'vitest';
import { AppError } from '#lib/services/error.service.ts';
import { medidasAjustadas, validarImagen } from './imagen.ts';

describe('medidasAjustadas', () => {
	it('achica por el lado más largo y nunca agranda', () => {
		expect(medidasAjustadas(4000, 3000, 1280)).toEqual({ ancho: 1280, alto: 960 });
		expect(medidasAjustadas(1000, 2000, 640)).toEqual({ ancho: 320, alto: 640 });
		expect(medidasAjustadas(300, 200, 640)).toEqual({ ancho: 300, alto: 200 });
	});
});

describe('validarImagen', () => {
	it('rechaza lo que la API no acepta, con un mensaje para la persona', () => {
		expect(() => validarImagen(new Blob(['<svg/>'], { type: 'image/svg+xml' }))).toThrow(AppError);
		expect(() => validarImagen(new Blob(['%PDF'], { type: 'application/pdf' }))).toThrow(
			/debe ser una imagen/
		);
		expect(() => validarImagen(new Blob(['x'], { type: 'image/png' }))).not.toThrow();
	});
});
