import { describe, expect, it } from 'vitest';
import { TEMA_PRESETS } from './temasTarjeta.config.ts';
import { esTipografiaValida } from './tipografiasTarjeta.config.ts';
import {
	buscarRubro,
	GRUPOS_RUBRO,
	normalizarTexto,
	RUBRO_GENERICO,
	RUBROS,
	schemaDeRubro,
	sugerenciasDeRubro,
	valoresDeRubro
} from './rubros.config.ts';

describe('lista de rubros', () => {
	it('no repite nombres, ni aunque cambien tildes o mayúsculas', () => {
		const nombres = RUBROS.map((rubro) => normalizarTexto(rubro.nombre));
		expect(new Set(nombres).size).toBe(nombres.length);
		expect(new Set(GRUPOS_RUBRO.map((g) => g.id)).size).toBe(GRUPOS_RUBRO.length);
	});

	it('cada rubro sugiere un tema, una tipografía y un tipo de Schema.org que existen', () => {
		for (const rubro of RUBROS) {
			expect(TEMA_PRESETS, rubro.nombre).toContain(rubro.preset);
			expect(esTipografiaValida(rubro.tipografia), rubro.nombre).toBe(true);
			expect(rubro.schema, rubro.nombre).toMatch(/^[A-Z][A-Za-z]+$/);
			expect(rubro.tituloVitrina.trim(), rubro.nombre).not.toBe('');
		}
	});
});

describe('búsqueda de rubros', () => {
	it('encuentra el rubro sin importar tildes ni mayúsculas', () => {
		expect(buscarRubro('pediatria')?.nombre).toBe('Pediatría');
		expect(buscarRubro('  ODONTOLOGÍA ')?.nombre).toBe('Odontología');
		expect(buscarRubro('')).toBeUndefined();
	});

	it('sugiere primero los que empiezan con lo escrito', () => {
		const sugerencias = sugerenciasDeRubro('abo');
		expect(sugerencias.length).toBeGreaterThan(0);
		expect(normalizarTexto(sugerencias[0].nombre).startsWith('abo')).toBe(true);
		expect(sugerenciasDeRubro('', 5)).toHaveLength(5);
	});

	it('un rubro escrito a mano usa los valores genéricos', () => {
		expect(valoresDeRubro('Restauración de pianos')).toEqual(RUBRO_GENERICO);
		expect(schemaDeRubro('Pediatría')).toBe('Physician');
		expect(schemaDeRubro(null)).toBe('ProfessionalService');
	});
});
