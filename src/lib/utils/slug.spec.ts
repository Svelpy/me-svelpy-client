import { describe, expect, it } from 'vitest';
import { SLUG_MAX } from '#lib/constants/slugs.ts';
import { slugSchema } from '#lib/zod/common.ts';
import { slugify, sugerirSlug } from './slug.ts';

describe('slugify', () => {
	it('quita tildes, eñes, mayúsculas y signos', () => {
		expect(slugify('Dra. Fabiola Méndez Ñuflo')).toBe('dra-fabiola-mendez-nuflo');
		expect(slugify('  --Hola__Mundo--  ')).toBe('hola-mundo');
	});

	it('no pasa del largo máximo ni termina en guion', () => {
		const slug = slugify(`${'consultorio '.repeat(10)}final`);
		expect(slug.length).toBeLessThanOrEqual(SLUG_MAX);
		expect(slug.endsWith('-')).toBe(false);
	});
});

describe('sugerirSlug', () => {
	it('usa el prefijo, el nombre y el primer apellido', () => {
		expect(sugerirSlug({ prefijo: 'Dra.', nombres: 'Fabiola', apellidos: 'Mendoza Rojas' })).toBe(
			'dra-fabiola-mendoza'
		);
		expect(sugerirSlug({ nombres: 'Rodrigo', apellidos: null })).toBe('rodrigo');
	});
});

describe('slugSchema', () => {
	it('acepta y normaliza una dirección válida', () => {
		expect(slugSchema.parse(' Doctora-Fabiola ')).toBe('doctora-fabiola');
	});

	it('rechaza direcciones cortas, con signos o con guion en los extremos', () => {
		expect(slugSchema.safeParse('ab').success).toBe(false);
		expect(slugSchema.safeParse('doctora_fabiola').success).toBe(false);
		expect(slugSchema.safeParse('-fabiola').success).toBe(false);
	});

	it('rechaza las direcciones reservadas por la app', () => {
		const resultado = slugSchema.safeParse('auth');
		expect(resultado.success).toBe(false);
		expect(resultado.error?.issues[0].message).toBe('Esa dirección está reservada. Elige otra.');
	});
});
