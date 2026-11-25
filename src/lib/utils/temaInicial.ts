import { valoresDeRubro } from '#lib/config/rubros.config.ts';
import { TIPOGRAFIA_POR_DEFECTO } from '#lib/config/tipografiasTarjeta.config.ts';
import type { TarjetaThemeCreateRequest } from '#lib/interfaces/index.ts';
import { tarjetaThemeService } from '#lib/services/index.ts';

/**
 * El tema con que nace una tarjeta según su rubro. La API solo acepta el preset al crearla
 * (`TarjetaThemeCreate`) y la deja con la tipografía 1; la sugerida se aplica justo después.
 */
export function temaDeRubro(rubro: string): TarjetaThemeCreateRequest {
	return { preset: valoresDeRubro(rubro).preset };
}

/**
 * Aplica la tipografía que sugiere el rubro a una tarjeta recién creada. Es un detalle de
 * bienvenida: si falla, la tarjeta queda con la tipografía por defecto y se cambia en el editor.
 * true si cambió algo (hay que volver a leer la tarjeta).
 */
export async function aplicarTipografiaDeRubro(tarjetaId: string, rubro: string): Promise<boolean> {
	const { tipografia } = valoresDeRubro(rubro);
	if (tipografia === TIPOGRAFIA_POR_DEFECTO) return false;
	try {
		await tarjetaThemeService.actualizar(tarjetaId, { tipografia });
		return true;
	} catch {
		// Se puede cambiar después en Apariencia
		return false;
	}
}
