/**
 * Tipografías de la tarjeta pública (`tarjeta_theme.tipografia` guarda el `id`). Cada opción es un
 * par de fuentes: una para los títulos y otra para el texto.
 *
 * Las fuentes son archivos locales (paquetes @fontsource-variable, servidos desde el propio dominio):
 * de cada familia se usa solo el woff2 "latin" de peso variable, que ya cubre á, é, ñ, ¿ y ¡.
 * `tarjetaFuentes.svelte` declara y precarga únicamente el par de la tarjeta que se está viendo.
 *
 * Los ids son estables: se guardan en la base de datos. Para retirar una opción no se reutiliza su id.
 */
import archivo from '@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2?url';
import bodoniModa from '@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-wght-normal.woff2?url';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url';
import fraunces from '@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url';
import inter from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import jost from '@fontsource-variable/jost/files/jost-latin-wght-normal.woff2?url';
import nunito from '@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url';
import plusJakarta from '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url';
import sora from '@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url';
import sourceSerif from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url';
import spaceGrotesk from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';

export interface FuenteTarjeta {
	/** Nombre con el que se declara (prefijo "ME" para no chocar con las fuentes del panel) */
	familia: string;
	/** URL del woff2 latin de peso variable */
	archivo: string;
	/** Rango de pesos que trae el archivo, p. ej. "200 800" */
	pesos: string;
	/** Fuentes del sistema mientras carga */
	respaldo: string;
}

const SANS = 'ui-sans-serif, system-ui, sans-serif';
const SERIF = 'ui-serif, Georgia, serif';

const FUENTES = {
	plusJakarta: {
		familia: 'ME Plus Jakarta Sans',
		archivo: plusJakarta,
		pesos: '200 800',
		respaldo: SANS
	},
	inter: { familia: 'ME Inter', archivo: inter, pesos: '100 900', respaldo: SANS },
	fraunces: { familia: 'ME Fraunces', archivo: fraunces, pesos: '100 900', respaldo: SERIF },
	sourceSerif: {
		familia: 'ME Source Serif',
		archivo: sourceSerif,
		pesos: '200 900',
		respaldo: SERIF
	},
	nunito: { familia: 'ME Nunito', archivo: nunito, pesos: '200 1000', respaldo: SANS },
	sora: { familia: 'ME Sora', archivo: sora, pesos: '100 800', respaldo: SANS },
	spaceGrotesk: {
		familia: 'ME Space Grotesk',
		archivo: spaceGrotesk,
		pesos: '300 700',
		respaldo: SANS
	},
	bodoniModa: { familia: 'ME Bodoni Moda', archivo: bodoniModa, pesos: '400 900', respaldo: SERIF },
	jost: { familia: 'ME Jost', archivo: jost, pesos: '100 900', respaldo: SANS },
	bricolage: {
		familia: 'ME Bricolage Grotesque',
		archivo: bricolage,
		pesos: '200 800',
		respaldo: SANS
	},
	archivo: { familia: 'ME Archivo', archivo: archivo, pesos: '100 900', respaldo: SANS }
} satisfies Record<string, FuenteTarjeta>;

export interface TipografiaTarjeta {
	id: number;
	nombre: string;
	/** Para qué tipo de profesional queda bien */
	descripcion: string;
	titulos: FuenteTarjeta;
	texto: FuenteTarjeta;
	/** Peso de los títulos (nombre y encabezados de sección) */
	pesoTitulos: number;
}

export const TIPOGRAFIAS_TARJETA: TipografiaTarjeta[] = [
	{
		id: 1,
		nombre: 'Actual',
		descripcion: 'Versátil y clara: sirve para cualquier rubro.',
		titulos: FUENTES.plusJakarta,
		texto: FUENTES.plusJakarta,
		pesoTitulos: 750
	},
	{
		id: 2,
		nombre: 'Editorial',
		descripcion: 'Serif cálida para terapia, consultoría y escritura.',
		titulos: FUENTES.fraunces,
		texto: FUENTES.inter,
		pesoTitulos: 600
	},
	{
		id: 3,
		nombre: 'Clásica',
		descripcion: 'Serif sobria para derecho, finanzas y notarías.',
		titulos: FUENTES.sourceSerif,
		texto: FUENTES.sourceSerif,
		pesoTitulos: 650
	},
	{
		id: 4,
		nombre: 'Amable',
		descripcion: 'Redondeada y cercana para salud, niños y educación.',
		titulos: FUENTES.nunito,
		texto: FUENTES.nunito,
		pesoTitulos: 800
	},
	{
		id: 5,
		nombre: 'Geométrica',
		descripcion: 'Moderna y precisa para tecnología y ejecutivos.',
		titulos: FUENTES.sora,
		texto: FUENTES.inter,
		pesoTitulos: 650
	},
	{
		id: 6,
		nombre: 'Técnica',
		descripcion: 'Con carácter de plano para arquitectura e ingeniería.',
		titulos: FUENTES.spaceGrotesk,
		texto: FUENTES.inter,
		pesoTitulos: 650
	},
	{
		id: 7,
		nombre: 'Elegante',
		descripcion: 'Contraste alto para belleza, moda y bodas.',
		titulos: FUENTES.bodoniModa,
		texto: FUENTES.jost,
		pesoTitulos: 600
	},
	{
		id: 8,
		nombre: 'Expresiva',
		descripcion: 'Con personalidad para cocina, eventos y marcas creativas.',
		titulos: FUENTES.bricolage,
		texto: FUENTES.plusJakarta,
		pesoTitulos: 750
	},
	{
		id: 9,
		nombre: 'Robusta',
		descripcion: 'Firme y compacta para deporte, talleres y construcción.',
		titulos: FUENTES.archivo,
		texto: FUENTES.archivo,
		pesoTitulos: 800
	}
];

export const TIPOGRAFIA_POR_DEFECTO = 1;

const POR_ID = new Map(TIPOGRAFIAS_TARJETA.map((tipografia) => [tipografia.id, tipografia]));

/** Tipografía por id; si el id ya no existe, la por defecto */
export function tipografiaPorId(id: number | null | undefined): TipografiaTarjeta {
	return POR_ID.get(id ?? TIPOGRAFIA_POR_DEFECTO) ?? POR_ID.get(TIPOGRAFIA_POR_DEFECTO)!;
}

export function esTipografiaValida(id: number): boolean {
	return POR_ID.has(id);
}

/** `font-family` completo de una fuente, con su respaldo */
export function familiaCss(fuente: FuenteTarjeta): string {
	return `'${fuente.familia}', ${fuente.respaldo}`;
}

/** Reglas @font-face de las fuentes indicadas (sin repetir familias) */
export function fontFaceCss(tipografias: TipografiaTarjeta[]): string {
	const fuentes = new Map<string, FuenteTarjeta>();
	for (const tipografia of tipografias) {
		fuentes.set(tipografia.titulos.familia, tipografia.titulos);
		fuentes.set(tipografia.texto.familia, tipografia.texto);
	}
	return [...fuentes.values()]
		.map(
			(fuente) =>
				`@font-face{font-family:'${fuente.familia}';font-style:normal;font-display:swap;` +
				`font-weight:${fuente.pesos};src:url(${fuente.archivo}) format('woff2-variations'),` +
				`url(${fuente.archivo}) format('woff2');}`
		)
		.join('');
}
