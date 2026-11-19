// Tema visual de una tarjeta ME (tabla `tarjeta_theme`). Los nombres de campo siguen a la base de datos.
import type { Timestamps } from './common.interface';

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
export type IconoForma = 'circulo' | 'redondeado' | 'cuadrado' | 'ninguno';
export type FabPosicion = 'derecha' | 'izquierda';

/** Colores (hex #RRGGBB) y estilo editables de una tarjeta: lo que define cada preset. */
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
	/** 0 a 100. */
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

export interface TarjetaTheme extends TarjetaThemeColores, Timestamps {
	id: string;
	tarjeta_id: string;
	/** Preset con el que se creó; los colores pueden haberse editado después. */
	preset: TemaPreset | null;
	/** Id de `TIPOGRAFIAS_TARJETA` (par de fuentes locales del frontend). */
	tipografia: number;
}

/** `PUT /tarjetas/{id}/theme`: el tema completo */
export interface TarjetaThemeUpdateRequest extends TarjetaThemeColores {
	preset: TemaPreset | null;
	tipografia: number;
}
