import { describe, expect, it } from 'vitest';
import { extraerCoordenadas } from './extraerCoordenadas.ts';

describe('extraerCoordenadas', () => {
	it('lee el centro del mapa de un enlace de lugar', () => {
		expect(
			extraerCoordenadas('https://www.google.com/maps/place/Consultorio/@-17.7833,-63.1821,17z')
		).toEqual({ lat: -17.7833, lng: -63.1821 });
	});

	it('prefiere el pin del lugar (!3d!4d) al centro del mapa (@)', () => {
		expect(
			extraerCoordenadas(
				'https://www.google.com/maps/place/X/@-17.70,-63.10,15z/data=!3d-17.786!4d-63.1804'
			)
		).toEqual({ lat: -17.786, lng: -63.1804 });
	});

	it('entiende las búsquedas por coordenadas', () => {
		expect(extraerCoordenadas('https://maps.google.com/?q=-16.5,-68.15')).toEqual({
			lat: -16.5,
			lng: -68.15
		});
		expect(
			extraerCoordenadas('https://www.google.com/maps/search/?api=1&query=-17.3895%2C-66.1568')
		).toEqual({ lat: -17.3895, lng: -66.1568 });
	});

	it('redondea a 6 decimales, como guarda la base de datos', () => {
		expect(extraerCoordenadas('https://maps.google.com/@-17.12345678,-63.98765432,12z')).toEqual({
			lat: -17.123457,
			lng: -63.987654
		});
	});

	it('sin coordenadas válidas devuelve null', () => {
		expect(extraerCoordenadas('https://maps.app.goo.gl/abc123')).toBeNull();
		expect(extraerCoordenadas('https://maps.google.com/@95.1,10.2,12z')).toBeNull();
	});
});
