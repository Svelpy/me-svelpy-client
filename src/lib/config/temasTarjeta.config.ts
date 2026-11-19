/**
 * Temas predefinidos de `tarjeta_theme.preset`. Son el punto de partida al crear una tarjeta: se copian
 * a la fila del tema y luego la persona puede editar cada color por separado. Cada grupo de rubros
 * sugiere uno (`rubros.config.ts`).
 * Si el backend define sus propios valores por defecto, mantener ambos iguales.
 * Los contrastes mínimos se verifican en temasTarjeta.config.spec.ts.
 */
import type { TarjetaThemeColores, TemaPreset } from '#lib/interfaces/tarjetaTheme.interface.ts';

export interface TemaTarjeta {
	nombre: string;
	descripcion: string;
	colores: TarjetaThemeColores;
}

export const TEMA_PRESETS: TemaPreset[] = [
	'claro',
	'oscuro',
	'elegante',
	'salud',
	'corporativo',
	'calido',
	'natural',
	'belleza',
	'creativo',
	'energia'
];

export const TEMA_PRESET_POR_DEFECTO: TemaPreset = 'claro';

export const TEMAS_TARJETA: Record<TemaPreset, TemaTarjeta> = {
	claro: {
		nombre: 'Claro',
		descripcion: 'Fondo blanco y azul: limpio y fácil de leer.',
		colores: {
			color_fondo: '#FFFFFF',
			color_superficie: '#F6F7F9',
			color_borde: '#E3E6EB',
			color_titulo: '#111827',
			color_texto: '#374151',
			color_texto_secundario: '#6B7280',
			color_primario: '#2563EB',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#E0E7FF',
			color_texto_sobre_secundario: '#1E3A8A',
			color_overlay_portada: '#000000',
			overlay_opacidad: 40,
			color_precio: '#047857',
			color_destacado: '#F59E0B',
			color_texto_sobre_destacado: '#111827',
			color_icono: '#2563EB',
			color_fondo_icono: '#EFF6FF',
			icono_forma: 'circulo',
			color_icono_social: '#374151',
			color_fondo_icono_social: '#F3F4F6',
			color_fab_fondo: '#2563EB',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	oscuro: {
		nombre: 'Oscuro',
		descripcion: 'Fondo grafito con acentos celestes.',
		colores: {
			color_fondo: '#111318',
			color_superficie: '#1B1E25',
			color_borde: '#2C313C',
			color_titulo: '#F9FAFB',
			color_texto: '#D1D5DB',
			color_texto_secundario: '#9CA3AF',
			color_primario: '#60A5FA',
			color_texto_sobre_primario: '#0B1220',
			color_secundario: '#273041',
			color_texto_sobre_secundario: '#E5E7EB',
			color_overlay_portada: '#000000',
			overlay_opacidad: 55,
			color_precio: '#34D399',
			color_destacado: '#FBBF24',
			color_texto_sobre_destacado: '#111827',
			color_icono: '#93C5FD',
			color_fondo_icono: '#1E293B',
			icono_forma: 'redondeado',
			color_icono_social: '#E5E7EB',
			color_fondo_icono_social: '#273041',
			color_fab_fondo: '#60A5FA',
			color_fab_icono: '#0B1220',
			fab_posicion: 'derecha'
		}
	},
	elegante: {
		nombre: 'Elegante',
		descripcion: 'Marfil, negro y dorado para una imagen sobria.',
		colores: {
			color_fondo: '#FAF8F5',
			color_superficie: '#FFFFFF',
			color_borde: '#E7E1D8',
			color_titulo: '#1C1917',
			color_texto: '#44403C',
			color_texto_secundario: '#6F6862',
			color_primario: '#1C1917',
			color_texto_sobre_primario: '#F5E6C8',
			color_secundario: '#F1EADF',
			color_texto_sobre_secundario: '#57452A',
			color_overlay_portada: '#1C1917',
			overlay_opacidad: 45,
			color_precio: '#7A5F2E',
			color_destacado: '#C9A86A',
			color_texto_sobre_destacado: '#1C1917',
			color_icono: '#7A5F2E',
			color_fondo_icono: '#F5EFE4',
			icono_forma: 'cuadrado',
			color_icono_social: '#1C1917',
			color_fondo_icono_social: '#F1EADF',
			color_fab_fondo: '#1C1917',
			color_fab_icono: '#F5E6C8',
			fab_posicion: 'derecha'
		}
	},
	salud: {
		nombre: 'Salud',
		descripcion: 'Verde azulado y blanco, pensado para consultorios.',
		colores: {
			color_fondo: '#F7FBFA',
			color_superficie: '#FFFFFF',
			color_borde: '#D5ECE7',
			color_titulo: '#0F3D38',
			color_texto: '#334155',
			color_texto_secundario: '#5B6B7F',
			color_primario: '#0F766E',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#CCFBF1',
			color_texto_sobre_secundario: '#115E59',
			color_overlay_portada: '#0F3D38',
			overlay_opacidad: 35,
			color_precio: '#0F766E',
			color_destacado: '#F472B6',
			color_texto_sobre_destacado: '#3B0A24',
			color_icono: '#0F766E',
			color_fondo_icono: '#CCFBF1',
			icono_forma: 'circulo',
			color_icono_social: '#0F766E',
			color_fondo_icono_social: '#E6F6F3',
			color_fab_fondo: '#0F766E',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	corporativo: {
		nombre: 'Corporativo',
		descripcion: 'Azul marino y gris para empresas y ejecutivos.',
		colores: {
			color_fondo: '#F8FAFC',
			color_superficie: '#FFFFFF',
			color_borde: '#E2E8F0',
			color_titulo: '#0F172A',
			color_texto: '#334155',
			color_texto_secundario: '#5B6B7F',
			color_primario: '#1E3A8A',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#E2E8F0',
			color_texto_sobre_secundario: '#1E293B',
			color_overlay_portada: '#0F172A',
			overlay_opacidad: 50,
			color_precio: '#1E3A8A',
			color_destacado: '#FACC15',
			color_texto_sobre_destacado: '#0F172A',
			color_icono: '#1E3A8A',
			color_fondo_icono: '#E0E7FF',
			icono_forma: 'redondeado',
			color_icono_social: '#1E293B',
			color_fondo_icono_social: '#F1F5F9',
			color_fab_fondo: '#1E3A8A',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	calido: {
		nombre: 'Cálido',
		descripcion: 'Rojo tomate y mostaza para cocinas, cafeterías y hogar.',
		colores: {
			color_fondo: '#FFF9F2',
			color_superficie: '#FFFFFF',
			color_borde: '#F1DFCC',
			color_titulo: '#3A1A0B',
			color_texto: '#4A3426',
			color_texto_secundario: '#7A5A44',
			color_primario: '#B42318',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#FDE8D0',
			color_texto_sobre_secundario: '#7A2E0E',
			color_overlay_portada: '#3A1A0B',
			overlay_opacidad: 45,
			color_precio: '#9A3412',
			color_destacado: '#F4B740',
			color_texto_sobre_destacado: '#3A1A0B',
			color_icono: '#B42318',
			color_fondo_icono: '#FDECE7',
			icono_forma: 'redondeado',
			color_icono_social: '#3A1A0B',
			color_fondo_icono_social: '#F7EBDD',
			color_fab_fondo: '#B42318',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	natural: {
		nombre: 'Natural',
		descripcion: 'Verde musgo y arena para bienestar, terapia y campo.',
		colores: {
			color_fondo: '#F6F7F2',
			color_superficie: '#FFFFFF',
			color_borde: '#DDE3D1',
			color_titulo: '#1F2A1C',
			color_texto: '#39463A',
			color_texto_secundario: '#5E6B5C',
			color_primario: '#4D6B3C',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#E4ECD9',
			color_texto_sobre_secundario: '#2F4424',
			color_overlay_portada: '#1F2A1C',
			overlay_opacidad: 40,
			color_precio: '#3F5A30',
			color_destacado: '#E9C46A',
			color_texto_sobre_destacado: '#1F2A1C',
			color_icono: '#4D6B3C',
			color_fondo_icono: '#E8EFDF',
			icono_forma: 'circulo',
			color_icono_social: '#2F4424',
			color_fondo_icono_social: '#EDF1E6',
			color_fab_fondo: '#4D6B3C',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	belleza: {
		nombre: 'Belleza',
		descripcion: 'Rosa profundo y blanco para estética, peluquería y moda.',
		colores: {
			color_fondo: '#FFF7F8',
			color_superficie: '#FFFFFF',
			color_borde: '#F3D9DF',
			color_titulo: '#3B0A1E',
			color_texto: '#4F2A36',
			color_texto_secundario: '#7D5260',
			color_primario: '#9D174D',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#FCE7EF',
			color_texto_sobre_secundario: '#831843',
			color_overlay_portada: '#3B0A1E',
			overlay_opacidad: 35,
			color_precio: '#9D174D',
			color_destacado: '#F9A8D4',
			color_texto_sobre_destacado: '#3B0A1E',
			color_icono: '#9D174D',
			color_fondo_icono: '#FCE7EF',
			icono_forma: 'circulo',
			color_icono_social: '#831843',
			color_fondo_icono_social: '#FDF0F5',
			color_fab_fondo: '#9D174D',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	creativo: {
		nombre: 'Creativo',
		descripcion: 'Violeta con naranja para diseño, fotografía y eventos.',
		colores: {
			color_fondo: '#F7F5FF',
			color_superficie: '#FFFFFF',
			color_borde: '#E2DDF7',
			color_titulo: '#1A1033',
			color_texto: '#3A3350',
			color_texto_secundario: '#5F5878',
			color_primario: '#5B21B6',
			color_texto_sobre_primario: '#FFFFFF',
			color_secundario: '#EDE9FE',
			color_texto_sobre_secundario: '#4C1D95',
			color_overlay_portada: '#1A1033',
			overlay_opacidad: 45,
			color_precio: '#5B21B6',
			color_destacado: '#FB923C',
			color_texto_sobre_destacado: '#1A1033',
			color_icono: '#5B21B6',
			color_fondo_icono: '#EDE9FE',
			icono_forma: 'cuadrado',
			color_icono_social: '#1A1033',
			color_fondo_icono_social: '#F1EEFB',
			color_fab_fondo: '#5B21B6',
			color_fab_icono: '#FFFFFF',
			fab_posicion: 'derecha'
		}
	},
	energia: {
		nombre: 'Energía',
		descripcion: 'Carbón y amarillo intenso para deporte, talleres y obra.',
		colores: {
			color_fondo: '#0F1115',
			color_superficie: '#1A1D23',
			color_borde: '#2B3039',
			color_titulo: '#F8FAFC',
			color_texto: '#D4D8DE',
			color_texto_secundario: '#A0A7B4',
			color_primario: '#FACC15',
			color_texto_sobre_primario: '#0F1115',
			color_secundario: '#262A31',
			color_texto_sobre_secundario: '#F1F5F9',
			color_overlay_portada: '#000000',
			overlay_opacidad: 55,
			color_precio: '#FDE047',
			color_destacado: '#F97316',
			color_texto_sobre_destacado: '#0F1115',
			color_icono: '#FACC15',
			color_fondo_icono: '#262A31',
			icono_forma: 'cuadrado',
			color_icono_social: '#F1F5F9',
			color_fondo_icono_social: '#262A31',
			color_fab_fondo: '#FACC15',
			color_fab_icono: '#0F1115',
			fab_posicion: 'derecha'
		}
	}
};
