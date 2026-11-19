import { describe, expect, it } from 'vitest';
import { queryConFiltros } from './filtrosUrl.ts';

const actual = (query: string) => new URLSearchParams(query);

describe('queryConFiltros', () => {
	it('agrega o cambia un filtro y vuelve a la primera página', () => {
		expect(queryConFiltros(actual('estado=publicada&page=3'), { q: 'pediatría' })).toBe(
			'estado=publicada&q=pediatr%C3%ADa'
		);
	});

	it('un valor vacío quita el filtro', () => {
		expect(queryConFiltros(actual('q=dra&estado=borrador'), { q: '' })).toBe('estado=borrador');
		expect(queryConFiltros(actual('q=dra'), { q: null })).toBe('');
	});

	it('cambiar de página conserva los filtros', () => {
		expect(queryConFiltros(actual('q=dra&page=1'), { page: '2' })).toBe('q=dra&page=2');
	});
});
