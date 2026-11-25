import { TEMA_PRESETS, TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import { familiaCss, tipografiaPorId } from '#lib/config/tipografiasTarjeta.config.ts';
import type {
	TarjetaTheme,
	TarjetaThemeColores,
	TarjetaThemeUpdateRequest,
	TemaPreset
} from '#lib/interfaces/index.ts';
import { esOscuro } from './color';

/** Los campos que define un preset (colores, overlay, forma de íconos y botón flotante) */
export const CAMPOS_PRESET = Object.keys(
	TEMAS_TARJETA.claro.colores
) as (keyof TarjetaThemeColores)[];

/** Compara valores del tema sin importar mayúsculas en los hex */
function mismoValor(a: string | number, b: string | number): boolean {
	return typeof a === 'string' && typeof b === 'string'
		? a.toLowerCase() === b.toLowerCase()
		: a === b;
}

/**
 * El preset cuyos valores coinciden con los del tema. La API deja `preset` en null cuando se
 * envían colores (aunque sean los de un preset), así que el panel lo reconoce comparando.
 * null = tema personalizado.
 */
export function presetCoincidente(
	tema: TarjetaThemeColores & { preset?: TemaPreset | null }
): TemaPreset | null {
	if (tema.preset) return tema.preset;
	return (
		TEMA_PRESETS.find((preset) =>
			CAMPOS_PRESET.every((campo) => mismoValor(TEMAS_TARJETA[preset].colores[campo], tema[campo]))
		) ?? null
	);
}

/**
 * Lo que cambió entre el tema guardado y el editado: lo único que se envía en
 * `PATCH /tarjeta-themes/{id}` (cambiar solo la tipografía no toca los colores ni el preset).
 */
export function cambiosDeTema(
	guardado: TarjetaTheme,
	editado: TarjetaThemeColores & { tipografia: number }
): TarjetaThemeUpdateRequest {
	const cambios: Record<string, string | number> = {};
	for (const campo of CAMPOS_PRESET) {
		if (!mismoValor(guardado[campo], editado[campo])) cambios[campo] = editado[campo];
	}
	if (guardado.tipografia !== editado.tipografia) cambios.tipografia = editado.tipografia;
	return cambios as TarjetaThemeUpdateRequest;
}

/**
 * Estilo en línea con las variables --t-* del tema y la tipografía de una tarjeta. Las leen las
 * utilidades de layout.css (bg-t-fondo, text-t-titulo, font-t-titulos…).
 */
export function variablesTema(tema: TarjetaThemeColores, tipografiaId: number): string {
	const tipografia = tipografiaPorId(tipografiaId);
	const variables: Record<string, string> = {
		'--t-fondo': tema.color_fondo,
		'--t-superficie': tema.color_superficie,
		'--t-borde': tema.color_borde,
		'--t-titulo': tema.color_titulo,
		'--t-texto': tema.color_texto,
		'--t-texto-sec': tema.color_texto_secundario,
		'--t-primario': tema.color_primario,
		'--t-sobre-primario': tema.color_texto_sobre_primario,
		'--t-secundario': tema.color_secundario,
		'--t-sobre-secundario': tema.color_texto_sobre_secundario,
		'--t-overlay': tema.color_overlay_portada,
		'--t-overlay-opacidad': String(Math.min(100, Math.max(0, tema.overlay_opacidad)) / 100),
		'--t-precio': tema.color_precio,
		'--t-destacado': tema.color_destacado,
		'--t-sobre-destacado': tema.color_texto_sobre_destacado,
		'--t-icono': tema.color_icono,
		'--t-fondo-icono': tema.color_fondo_icono,
		'--t-icono-social': tema.color_icono_social,
		'--t-fondo-icono-social': tema.color_fondo_icono_social,
		'--t-fab': tema.color_fab_fondo,
		'--t-fab-icono': tema.color_fab_icono,
		'--t-fuente-titulos': familiaCss(tipografia.titulos),
		'--t-fuente-texto': familiaCss(tipografia.texto),
		'--t-peso-titulos': String(tipografia.pesoTitulos),
		// Controles nativos (scroll, selección) acordes al fondo de la tarjeta
		'color-scheme': esOscuro(tema.color_fondo) ? 'dark' : 'light'
	};
	return Object.entries(variables)
		.map(([nombre, valor]) => `${nombre}:${valor}`)
		.join(';');
}
