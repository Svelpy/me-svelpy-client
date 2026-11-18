import { describe, expect, it } from 'vitest';
import type { TarjetaThemeColores } from '#lib/interfaces/tarjetaTheme.interface.ts';
import { TEMA_PRESET_POR_DEFECTO, TEMA_PRESETS, TEMAS_TARJETA } from './temasTarjeta.config.ts';

/** Contraste WCAG 2.x entre dos colores hex #RRGGBB. */
function contraste(a: string, b: string): number {
	const luminancia = (hex: string) => {
		const [r, g, b] = [1, 3, 5].map((i) => {
			const c = parseInt(hex.slice(i, i + 2), 16) / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
	return (claro + 0.05) / (oscuro + 0.05);
}

/** Campos de color (`color_*`) del tema. */
type Campo = Extract<keyof TarjetaThemeColores, `color_${string}`>;

// [texto, fondo, mínimo]: 4.5 para texto normal (AA), 3 para íconos y elementos gráficos.
const PARES: [Campo, Campo, number][] = [
	['color_titulo', 'color_fondo', 4.5],
	['color_titulo', 'color_superficie', 4.5],
	['color_texto', 'color_fondo', 4.5],
	['color_texto', 'color_superficie', 4.5],
	['color_texto_secundario', 'color_fondo', 4.5],
	['color_texto_secundario', 'color_superficie', 4.5],
	['color_texto_sobre_primario', 'color_primario', 4.5],
	['color_texto_sobre_secundario', 'color_secundario', 4.5],
	['color_precio', 'color_superficie', 4.5],
	['color_texto_sobre_destacado', 'color_destacado', 4.5],
	['color_icono', 'color_fondo_icono', 3],
	['color_icono_social', 'color_fondo_icono_social', 3],
	['color_fab_icono', 'color_fab_fondo', 3]
];

describe('Temas predefinidos de tarjeta', () => {
	it('define un tema por cada preset del modelo y el preset por defecto existe', () => {
		expect(Object.keys(TEMAS_TARJETA).sort()).toEqual([...TEMA_PRESETS].sort());
		expect(TEMA_PRESETS).toContain(TEMA_PRESET_POR_DEFECTO);
	});

	it.each(TEMA_PRESETS)('%s: colores en formato #RRGGBB y opacidad entre 0 y 100', (preset) => {
		const colores = TEMAS_TARJETA[preset].colores;
		for (const [campo, valor] of Object.entries(colores)) {
			if (campo.startsWith('color_')) expect(valor, campo).toMatch(/^#[0-9A-F]{6}$/);
		}
		expect(colores.overlay_opacidad).toBeGreaterThanOrEqual(0);
		expect(colores.overlay_opacidad).toBeLessThanOrEqual(100);
	});

	it.each(TEMA_PRESETS)('%s: cumple los contrastes mínimos', (preset) => {
		const colores = TEMAS_TARJETA[preset].colores;
		for (const [texto, fondo, minimo] of PARES) {
			const valor = contraste(colores[texto], colores[fondo]);
			expect(valor, `${texto} sobre ${fondo} = ${valor.toFixed(2)}`).toBeGreaterThanOrEqual(minimo);
		}
	});
});
