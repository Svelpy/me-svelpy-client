import { describe, expect, it } from 'vitest';
import {
	tarjetaCompletaDePrueba,
	tarjetaDePrueba
} from '#lib/components/features/tarjeta/tarjetaDePrueba.ts';
import type { TarjetaPublica } from '#lib/interfaces/index.ts';
import { construirJsonLd } from './jsonLdTarjeta.ts';
import { aPublica } from './tarjeta.ts';

const URL_TARJETA = 'https://me.svelpy.com/doctora-prueba';
type Nodo = Record<string, unknown> & { '@type': string };

function grafo(tarjeta: TarjetaPublica): Nodo[] {
	return construirJsonLd(tarjeta, URL_TARJETA)['@graph'] as Nodo[];
}

describe('construirJsonLd', () => {
	it('describe a la persona, su negocio con el tipo del rubro y sus preguntas', () => {
		const nodos = grafo(tarjetaDePrueba());
		expect(nodos.map((n) => n['@type'])).toEqual(['Person', 'Physician', 'FAQPage']);

		const persona = nodos[0];
		expect(persona).toMatchObject({
			'@id': `${URL_TARJETA}#persona`,
			name: 'Dra. Lucía Prueba',
			honorificPrefix: 'Dra.',
			jobTitle: 'Pediatra',
			telephone: '+59170000000',
			worksFor: { '@id': `${URL_TARJETA}#negocio` }
		});
		expect(nodos[2]).toMatchObject({
			mainEntity: [
				{
					'@type': 'Question',
					name: '¿Atiendes urgencias?',
					acceptedAnswer: { '@type': 'Answer', text: 'Sí, de lunes a sábado.' }
				}
			]
		});
	});

	it('un rubro que no está en la lista usa un servicio profesional genérico', () => {
		const nodos = grafo(tarjetaDePrueba({ rubro: 'Restauración de pianos' }));
		expect(nodos[1]['@type']).toBe('ProfessionalService');
	});

	it('lo que la tarjeta oculta tampoco va a los buscadores', () => {
		const completa = tarjetaCompletaDePrueba();
		const secciones = completa.secciones.map((s) =>
			s.clave === 'faq' || s.clave === 'acerca' ? { ...s, is_visible: false } : s
		);
		// Como la publica la API: sin las secciones ocultas
		const nodos = grafo(aPublica({ ...completa, secciones }));
		expect(nodos.map((n) => n['@type'])).toEqual(['Person', 'Physician']);
		expect(nodos[0]).not.toHaveProperty('description');
	});

	it('solo publica imágenes con su URL https', () => {
		const nodos = grafo(tarjetaDePrueba({ profile_url: 'data:image/png;base64,AAAA' }));
		expect(nodos[0]).not.toHaveProperty('image');
	});
});
