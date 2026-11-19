import type { TarjetaThemeColores } from '#lib/interfaces/index.ts';

/** Utilidades de color para los temas de tarjeta (hex #RRGGBB) */

const HEX_LARGO = /^#?([0-9a-f]{6})$/i;
const HEX_CORTO = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;

export function esHexValido(valor: string): boolean {
	return /^#[0-9a-f]{6}$/i.test(valor);
}

/** Normaliza a #RRGGBB en mayúsculas; acepta #RGB y sin "#". null si no es un color válido */
export function normalizarHex(valor: string): string | null {
	const texto = valor.trim();
	const corto = HEX_CORTO.exec(texto);
	if (corto)
		return `#${corto[1]}${corto[1]}${corto[2]}${corto[2]}${corto[3]}${corto[3]}`.toUpperCase();
	const largo = HEX_LARGO.exec(texto);
	return largo ? `#${largo[1].toUpperCase()}` : null;
}

/** Luminancia relativa WCAG 2.x: 0 = negro, 1 = blanco */
export function luminancia(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
		return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG 2.x entre dos colores: de 1 (iguales) a 21 (negro sobre blanco) */
export function contraste(a: string, b: string): number {
	const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
	return (claro + 0.05) / (oscuro + 0.05);
}

/** true si el color es oscuro: sobre él, el texto blanco contrasta más que el negro */
export function esOscuro(hex: string): boolean {
	return luminancia(hex) < 0.179;
}

/** Opacidad 0–100 → canal alfa hex de 2 dígitos (para #RRGGBBAA) */
export function alfaHex(opacidad: number): string {
	const valor = Math.min(100, Math.max(0, opacidad));
	return Math.round((valor / 100) * 255)
		.toString(16)
		.padStart(2, '0');
}

/** Campos de color (`color_*`) del tema */
export type CampoColor = Extract<keyof TarjetaThemeColores, `color_${string}`>;

export interface ParContraste {
	texto: CampoColor;
	fondo: CampoColor;
	/** 4.5 para texto (AA); 3 para íconos y elementos gráficos */
	minimo: number;
	/** Qué se lee mal si no cumple, en palabras del usuario */
	descripcion: string;
}

/** Combinaciones del tema que deben leerse bien. Las usan el editor de apariencia y el spec de presets */
export const PARES_CONTRASTE: ParContraste[] = [
	{
		texto: 'color_titulo',
		fondo: 'color_fondo',
		minimo: 4.5,
		descripcion: 'Títulos sobre el fondo'
	},
	{
		texto: 'color_titulo',
		fondo: 'color_superficie',
		minimo: 4.5,
		descripcion: 'Títulos sobre las secciones'
	},
	{ texto: 'color_texto', fondo: 'color_fondo', minimo: 4.5, descripcion: 'Texto sobre el fondo' },
	{
		texto: 'color_texto',
		fondo: 'color_superficie',
		minimo: 4.5,
		descripcion: 'Texto sobre las secciones'
	},
	{
		texto: 'color_texto_secundario',
		fondo: 'color_fondo',
		minimo: 4.5,
		descripcion: 'Texto secundario sobre el fondo'
	},
	{
		texto: 'color_texto_secundario',
		fondo: 'color_superficie',
		minimo: 4.5,
		descripcion: 'Texto secundario sobre las secciones'
	},
	{
		texto: 'color_texto_sobre_primario',
		fondo: 'color_primario',
		minimo: 4.5,
		descripcion: 'Texto del botón principal'
	},
	{
		texto: 'color_texto_sobre_secundario',
		fondo: 'color_secundario',
		minimo: 4.5,
		descripcion: 'Texto de los botones secundarios'
	},
	{
		texto: 'color_precio',
		fondo: 'color_superficie',
		minimo: 4.5,
		descripcion: 'Precios de la vitrina'
	},
	{
		texto: 'color_texto_sobre_destacado',
		fondo: 'color_destacado',
		minimo: 4.5,
		descripcion: 'Texto de la insignia "Destacado"'
	},
	{
		texto: 'color_icono',
		fondo: 'color_fondo_icono',
		minimo: 3,
		descripcion: 'Íconos de contacto'
	},
	{
		texto: 'color_icono_social',
		fondo: 'color_fondo_icono_social',
		minimo: 3,
		descripcion: 'Íconos de redes'
	},
	{
		texto: 'color_fab_icono',
		fondo: 'color_fab_fondo',
		minimo: 3,
		descripcion: 'Ícono del botón flotante'
	}
];

/** Pares del tema que no llegan a su contraste mínimo, con el valor medido */
export function paresConContrasteBajo(
	colores: TarjetaThemeColores
): (ParContraste & { valor: number })[] {
	return PARES_CONTRASTE.map((par) => ({
		...par,
		valor: contraste(colores[par.texto], colores[par.fondo])
	})).filter((par) => par.valor < par.minimo);
}
