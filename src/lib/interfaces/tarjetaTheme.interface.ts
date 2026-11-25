// Tema visual de una tarjeta ME. Los nombres de campo siguen a la API (`TarjetaTheme*`).
import type { Timestamps } from './common.interface';

/** Enum `PresetTheme` */
export type TemaPreset =
	| 'claro'
	| 'oscuro'
	| 'elegante'
	| 'salud'
	| 'corporativo'
	| 'calido'
	| 'natural'
	| 'belleza'
	| 'creativo'
	| 'energia';
/** Enum `FormaIcono` */
export type IconoForma = 'circulo' | 'redondeado' | 'cuadrado' | 'ninguno';
/** Enum `PosicionFab` */
export type FabPosicion = 'derecha' | 'izquierda';

/** Colores (hex #RRGGBB) y estilo de una tarjeta: lo que define cada preset */
export interface TarjetaThemeColores {
	color_fondo: string;
	color_superficie: string;
	color_borde: string;
	color_titulo: string;
	color_texto: string;
	color_texto_secundario: string;
	color_primario: string;
	color_texto_sobre_primario: string;
	color_secundario: string;
	color_texto_sobre_secundario: string;
	color_overlay_portada: string;
	/** 0 a 100 */
	overlay_opacidad: number;
	color_precio: string;
	color_destacado: string;
	color_texto_sobre_destacado: string;
	color_icono: string;
	color_fondo_icono: string;
	icono_forma: IconoForma;
	color_icono_social: string;
	color_fondo_icono_social: string;
	color_fab_fondo: string;
	color_fab_icono: string;
	fab_posicion: FabPosicion;
}

/** `TarjetaThemePublic` */
export interface TarjetaThemePublico extends TarjetaThemeColores {
	/** Id de `TIPOGRAFIAS_TARJETA` (par de fuentes locales del frontend) */
	tipografia: number;
}

/** `TarjetaThemeResponse`. Su id es el de la tarjeta */
export interface TarjetaTheme extends TarjetaThemePublico, Timestamps {
	id: string;
	/**
	 * Preset aplicado. El backend lo deja en null en cuanto se edita un valor del preset (colores,
	 * forma de ícono, botón flotante, overlay); el preset se reconoce entonces con `presetCoincidente()`.
	 */
	preset: TemaPreset | null;
}

/**
 * `PATCH /tarjeta-themes/{id}` (`TarjetaThemeUpdate`): lo que no se envía no cambia. No acepta
 * `preset`; cambiar solo la tipografía no toca los colores.
 */
export type TarjetaThemeUpdateRequest = Partial<TarjetaThemePublico>;

/** `TarjetaThemeCreate`: solo el preset; el backend copia sus valores y la tipografía es 1 */
export interface TarjetaThemeCreateRequest {
	preset?: TemaPreset;
}
