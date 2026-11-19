import { describe, expect, it } from 'vitest';
import {
	esTipografiaValida,
	familiaCss,
	fontFaceCss,
	TIPOGRAFIA_POR_DEFECTO,
	TIPOGRAFIAS_TARJETA,
	tipografiaPorId
} from './tipografiasTarjeta.config.ts';

describe('tipografías de la tarjeta', () => {
	it('cada par tiene un id único y estable (es lo que guarda la base de datos)', () => {
		const ids = TIPOGRAFIAS_TARJETA.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toContain(TIPOGRAFIA_POR_DEFECTO);
		expect(ids.every((id) => Number.isInteger(id) && id > 0 && id <= 32767)).toBe(true);
	});

	it('todas las fuentes son archivos locales, no de otros dominios', () => {
		for (const tipografia of TIPOGRAFIAS_TARJETA) {
			for (const fuente of [tipografia.titulos, tipografia.texto]) {
				expect(fuente.archivo, tipografia.nombre).toMatch(/\.woff2(\?.*)?$/);
				expect(fuente.archivo, tipografia.nombre).not.toMatch(/^https?:\/\//);
			}
		}
	});

	it('un id que ya no existe cae en la tipografía por defecto', () => {
		expect(tipografiaPorId(999).id).toBe(TIPOGRAFIA_POR_DEFECTO);
		expect(tipografiaPorId(null).id).toBe(TIPOGRAFIA_POR_DEFECTO);
		expect(esTipografiaValida(999)).toBe(false);
	});

	it('genera la regla @font-face de cada familia del par, sin repetir', () => {
		const actual = tipografiaPorId(1);
		const css = fontFaceCss([actual, actual]);
		const familias = new Set([actual.titulos.familia, actual.texto.familia]);
		expect(css.match(/@font-face/g)).toHaveLength(familias.size);
		expect(css).toContain(`font-family:'${actual.titulos.familia}'`);
		expect(css).toContain('font-display:swap');
		expect(familiaCss(actual.texto)).toMatch(new RegExp(`^'${actual.texto.familia}', `));
	});
});
