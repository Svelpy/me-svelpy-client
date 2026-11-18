/**
 * Temas predefinidos de `tarjeta_theme.preset`. Son el punto de partida al crear una tarjeta: se copian
 * a la fila del tema y luego la persona puede editar cada color por separado.
 * Si el backend define sus propios valores por defecto, mantener ambos iguales.
 * Los contrastes mínimos se verifican en temasTarjeta.config.spec.ts.
 */
import type { TarjetaThemeColores, TemaPreset } from '#lib/interfaces/tarjetaTheme.interface.ts';

export interface TemaTarjeta {
	nombre: string;
	descripcion: string;
	colores: TarjetaThemeColores;
}

export const TEMA_PRESETS: TemaPreset[] = ['claro', 'oscuro', 'elegante', 'salud', 'corporativo'];

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
	}
};
