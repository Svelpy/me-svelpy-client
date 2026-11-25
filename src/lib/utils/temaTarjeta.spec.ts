import { describe, expect, it } from 'vitest';
import { tarjetaCompletaDePrueba } from '#lib/components/features/tarjeta/tarjetaDePrueba.ts';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import { cambiosDeTema, presetCoincidente } from './temaTarjeta.ts';

const guardado = tarjetaCompletaDePrueba().theme;

describe('presetCoincidente', () => {
	it('reconoce el preset aunque la API lo haya dejado en null', () => {
		expect(presetCoincidente({ ...TEMAS_TARJETA.natural.colores, preset: null })).toBe('natural');
	});

	it('no distingue mayúsculas en los hex', () => {
		const colores = { ...TEMAS_TARJETA.claro.colores };
		colores.color_fondo = colores.color_fondo.toLowerCase();
		expect(presetCoincidente(colores)).toBe('claro');
	});

	it('con un color propio es personalizado', () => {
		expect(
			presetCoincidente({ ...TEMAS_TARJETA.claro.colores, color_primario: '#123456', preset: null })
		).toBeNull();
	});
});

describe('cambiosDeTema', () => {
	it('cambiar solo la tipografía envía solo la tipografía', () => {
		expect(cambiosDeTema(guardado, { ...guardado, tipografia: 4 })).toEqual({ tipografia: 4 });
	});

	it('elegir otro preset envía sus valores distintos, nada más', () => {
		const cambios = cambiosDeTema(guardado, {
			...TEMAS_TARJETA.oscuro.colores,
			tipografia: guardado.tipografia
		});
		expect(cambios).not.toHaveProperty('tipografia');
		expect(cambios.color_fondo).toBe(TEMAS_TARJETA.oscuro.colores.color_fondo);
		expect(cambios).not.toHaveProperty('preset');
	});

	it('sin cambios no hay nada que enviar', () => {
		expect(cambiosDeTema(guardado, { ...guardado })).toEqual({});
	});
});
