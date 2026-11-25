import { describe, expect, it } from 'vitest';
import { tarjetaCompletaDePrueba } from '#lib/components/features/tarjeta/tarjetaDePrueba.ts';
import type { VitrinaCompleta, VitrinaItem } from '#lib/interfaces/index.ts';
import { aPublica, formatearPrecio, numeroDe } from './tarjeta.ts';

const FECHA = '2026-01-15T12:00:00.000Z';

function item(cambios: Partial<VitrinaItem>): VitrinaItem {
	return {
		id: 'i',
		vitrina_id: 'v',
		categoria_id: null,
		categoria: null,
		titulo: 'Ítem',
		descripcion: null,
		precio: '100.00',
		precio_anterior: '120.00',
		precio_etiqueta: 'desde',
		campo1: null,
		campo2: null,
		campo3: null,
		campo4: null,
		destacado: false,
		is_visible: true,
		orden: 0,
		imagenes: [],
		created_at: FECHA,
		updated_at: FECHA,
		...cambios
	};
}

function vitrina(cambios: Partial<VitrinaCompleta>): VitrinaCompleta {
	return { ...tarjetaCompletaDePrueba().vitrina, ...cambios };
}

describe('aPublica', () => {
	it('deja solo lo visible y en su orden, como la tarjeta publicada', () => {
		const completa = tarjetaCompletaDePrueba({
			secciones: tarjetaCompletaDePrueba().secciones.map((s) =>
				s.clave === 'faq' ? { ...s, is_visible: false, orden: 0 } : { ...s, orden: s.orden + 1 }
			),
			faqs: [
				{ ...tarjetaCompletaDePrueba().faqs[0], id: 'b', orden: 1 },
				{ ...tarjetaCompletaDePrueba().faqs[0], id: 'a', orden: 0 },
				{ ...tarjetaCompletaDePrueba().faqs[0], id: 'oculta', orden: 2, is_visible: false }
			]
		});
		const publica = aPublica(completa);
		expect(publica.secciones.map((s) => s.clave)).not.toContain('faq');
		expect(publica.secciones[0]).toEqual({ clave: 'acerca', titulo: null });
		expect(publica.faqs.map((f) => f.id)).toEqual(['a', 'b']);
	});

	it('sin mostrar precios, los ítems salen sin precio', () => {
		const publica = aPublica(
			tarjetaCompletaDePrueba({ vitrina: vitrina({ mostrar_precios: false, items: [item({})] }) })
		);
		expect(publica.vitrina.items[0]).toMatchObject({
			precio: null,
			precio_anterior: null,
			precio_etiqueta: null
		});
	});

	it('los ítems de una categoría oculta no se ven', () => {
		const publica = aPublica(
			tarjetaCompletaDePrueba({
				vitrina: vitrina({
					categorias: [
						{
							id: 'oculta',
							vitrina_id: 'v',
							nombre: 'Oculta',
							is_visible: false,
							orden: 0,
							created_at: FECHA,
							updated_at: FECHA
						}
					],
					items: [item({ id: 'suelto' }), item({ id: 'dentro', categoria_id: 'oculta', orden: 1 })]
				})
			})
		);
		expect(publica.vitrina.categorias).toEqual([]);
		expect(publica.vitrina.items.map((i) => i.id)).toEqual(['suelto']);
	});
});

describe('precios', () => {
	it('lee los decimales que la API manda como texto', () => {
		expect(numeroDe('250.00')).toBe(250);
		expect(numeroDe('79.5')).toBe(79.5);
		expect(numeroDe(null)).toBeNull();
		expect(numeroDe('abc')).toBeNull();
		expect(formatearPrecio('250.00', 'BOB')).toBe(formatearPrecio(250, 'BOB'));
	});
});
