import { describe, expect, it } from 'vitest';
import { SLUG_MAX } from '#lib/constants/slugs.ts';
import { slugSchema } from '#lib/zod/common.ts';
import {
	alternativasDeSlug,
	limpiarSlugEscrito,
	motivoSlugInvalido,
	slugify,
	sugerirSlug
} from './slug.ts';

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
		expect(resultado.error?.issues[0].message).toBe('Ese enlace está reservado. Elige otro.');
	});
});

describe('limpiarSlugEscrito', () => {
	it('convierte lo escrito en dirección sin cortar el guion final', () => {
		expect(limpiarSlugEscrito('Rocío Suárez')).toBe('rocio-suarez');
		expect(limpiarSlugEscrito('Rocío ')).toBe('rocio-');
		expect(limpiarSlugEscrito('  -Dra. Ñuflo')).toBe('dra-nuflo');
		expect(limpiarSlugEscrito('mi__tarjeta!!2')).toBe('mi-tarjeta-2');
	});
});

describe('motivoSlugInvalido', () => {
	it('explica lo que el servidor rechazaría, sin preguntarle', () => {
		expect(motivoSlugInvalido('ab')).toMatch(/al menos 3/);
		expect(motivoSlugInvalido('dra--ana')).toMatch(/guiones simples/);
		expect(motivoSlugInvalido('panel')).toMatch(/reservada/);
		expect(motivoSlugInvalido('dra-ana-perez')).toBeNull();
	});
});

describe('alternativasDeSlug', () => {
	it('propone variantes con las pistas y con números, válidas y sin repetir', () => {
		const opciones = alternativasDeSlug('dra-ana', ['Pérez Quispe', 'Pediatría', null]);
		expect(opciones.slice(0, 2)).toEqual(['dra-ana-perez-quispe', 'dra-ana-pediatria']);
		expect(opciones).toContain('dra-ana-2');
		expect(new Set(opciones).size).toBe(opciones.length);
		expect(opciones.every((opcion) => motivoSlugInvalido(opcion) === null)).toBe(true);
	});

	it('no repite una pista que ya está en el enlace', () => {
		expect(alternativasDeSlug('ana-pediatria', ['pediatría'])[0]).toBe('ana-pediatria-2');
	});
});
