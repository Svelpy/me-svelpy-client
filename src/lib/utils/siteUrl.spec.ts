import { describe, expect, it } from 'vitest';
import { siteOrigin } from './siteUrl.ts';

describe('siteOrigin', () => {
	it('devuelve el origen sin barra final', () => {
		expect(siteOrigin('https://me.svelpy.com/')).toBe('https://me.svelpy.com');
		expect(siteOrigin('  https://me.svelpy.com  ')).toBe('https://me.svelpy.com');
	});

	it('corrige una URL sin las barras después del protocolo', () => {
		expect(siteOrigin('https:me.svelpy.com')).toBe('https://me.svelpy.com');
	});

	it('falla si la variable falta o no es una URL', () => {
		expect(() => siteOrigin(undefined)).toThrow(/PUBLIC_SITE_URL/);
		expect(() => siteOrigin('me.svelpy.com')).toThrow(/PUBLIC_SITE_URL/);
		expect(() => siteOrigin('ftp://me.svelpy.com')).toThrow(/https/);
	});
});
