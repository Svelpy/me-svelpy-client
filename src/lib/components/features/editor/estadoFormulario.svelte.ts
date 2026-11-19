import type { ZodType } from 'zod';
import { errorService } from '#lib/services/index.ts';
import { validateSchema } from '#lib/utils/validateSchema.ts';

/**
 * Estado de un formulario del editor: valida con el mismo esquema zod que usa el backend, llama a la
 * API y reparte los errores (de zod o de los `details` de la API) entre los campos.
 */
export class EstadoFormulario {
	errores = $state<Record<string, string>>({});
	error = $state('');
	enviando = $state(false);

	async enviar<T>(
		schema: ZodType<T>,
		datos: unknown,
		accion: (validos: T) => Promise<void>
	): Promise<boolean> {
		const resultado = validateSchema(schema, datos);
		if (!resultado.success) {
			this.errores = resultado.errors;
			this.error = 'Revisa los campos marcados.';
			return false;
		}
		this.errores = {};
		this.error = '';
		this.enviando = true;
		try {
			await accion(resultado.data);
			return true;
		} catch (causa) {
			this.errores = errorService.getFieldErrors(causa);
			this.error = errorService.getMessage(causa);
			return false;
		} finally {
			this.enviando = false;
		}
	}

	limpiar(): void {
		this.errores = {};
		this.error = '';
	}
}

/** "" → null; "12,5" o "12.5" → 12.5 (para inputs numéricos opcionales) */
export function numeroONull(valor: unknown): number | null {
	if (valor === null || valor === undefined) return null;
	const texto = String(valor).trim().replace(',', '.');
	if (texto === '') return null;
	const numero = Number(texto);
	return Number.isFinite(numero) ? numero : Number.NaN;
}
