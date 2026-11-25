import { describe, expect, it } from 'vitest';
import { tarjetaCompletaDePrueba } from '#lib/components/features/tarjeta/tarjetaDePrueba.ts';
import type { VitrinaItem } from '#lib/interfaces/index.ts';
import {
	conOrden,
	contactoNested,
	educacionNested,
	itemNested,
	seccionNested,
	ubicacionNested
} from './tarjetaNested.ts';

describe('mapeadores a *NestedItem', () => {
	it('envían solo los campos que acepta la API (sin fechas ni tarjeta_id)', () => {
		const [contacto] = tarjetaCompletaDePrueba().contactos;
		const enviado = contactoNested(contacto);
		expect(Object.keys(enviado).sort()).toEqual(
			['etiqueta', 'id', 'is_primary', 'is_visible', 'is_wpp', 'orden', 'tipo', 'valor'].sort()
		);
		expect(enviado).not.toHaveProperty('created_at');
		expect(enviado).not.toHaveProperty('tarjeta_id');
	});

	it('un elemento nuevo va sin id y con los valores por defecto', () => {
		expect(contactoNested({ tipo: 'email', valor: 'a@b.com' })).toEqual({
			id: null,
			tipo: 'email',
			valor: 'a@b.com',
			etiqueta: null,
			is_wpp: false,
			is_primary: false,
			is_visible: true,
			orden: 0
		});
	});

	it('WhatsApp solo en teléfonos y sin fecha de fin si lo sigue cursando', () => {
		expect(contactoNested({ tipo: 'email', valor: 'a@b.com', is_wpp: true }).is_wpp).toBe(false);
		expect(
			educacionNested({ institucion: 'UMSA', is_actual: true, fecha_fin: '2020-01-01' }).fecha_fin
		).toBeNull();
	});

	it('los horarios conservan su id y van en HH:MM', () => {
		const enviada = ubicacionNested({
			direccion: 'Av. Siempre Viva 742',
			horarios: [
				{ id: 'h1', dia_semana: 1, hora_inicio: '08:30:00', hora_fin: '12:30:00' },
				{ dia_semana: 2, hora_inicio: '09:00', hora_fin: '13:00' }
			]
		});
		expect(enviada.horarios).toEqual([
			{ id: 'h1', dia_semana: 1, hora_inicio: '08:30', hora_fin: '12:30' },
			{ id: null, dia_semana: 2, hora_inicio: '09:00', hora_fin: '13:00' }
		]);
	});

	it('un ítem manda sus imágenes en orden y sin la categoría embebida', () => {
		const item = {
			id: 'i1',
			categoria_id: 'c1',
			categoria: { id: 'c1' },
			titulo: 'Consulta',
			precio: '250.00',
			imagenes: [
				{ id: 'a', url: 'https://x/a.jpg', alt: null, orden: 5 },
				{ url: 'https://x/b.jpg', alt: 'B' }
			]
		} as unknown as VitrinaItem;
		const enviado = itemNested(item);
		expect(enviado).not.toHaveProperty('categoria');
		expect(enviado.precio).toBe('250.00');
		expect(enviado.imagenes).toEqual([
			{ id: 'a', url: 'https://x/a.jpg', alt: null, orden: 0 },
			{ id: null, url: 'https://x/b.jpg', alt: 'B', orden: 1 }
		]);
	});

	it('las secciones van con id, título, visibilidad y orden (sin la clave)', () => {
		const [seccion] = tarjetaCompletaDePrueba().secciones;
		expect(seccionNested(seccion)).toEqual({
			id: seccion.id,
			titulo: null,
			is_visible: true,
			orden: 0
		});
	});
});

describe('conOrden', () => {
	it('el orden es la posición en la lista', () => {
		expect(conOrden([{ orden: 7 }, { orden: 0 }, { orden: 2 }]).map((e) => e.orden)).toEqual([
			0, 1, 2
		]);
	});
});
