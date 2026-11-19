import type { ZodType, ZodError } from 'zod';

export type ValidationResult<T> =
	{ success: true; data: T } | { success: false; errors: Record<string, string> };

export function validateSchema<T>(schema: ZodType<T>, data: unknown): ValidationResult<T> {
	const result = schema.safeParse(data);

	if (result.success) {
		return {
			success: true,
			data: result.data
		};
	}
	const errors = formatZodErrors(result.error);

	return {
		success: false,
		errors
	};
}

/**
 * Primer mensaje por campo. Los campos anidados usan la ruta con puntos
 * (horarios.2.hora_fin), igual que los details de la API.
 */
function formatZodErrors(error: ZodError): Record<string, string> {
	const formatted: Record<string, string> = {};

	for (const issue of error.issues) {
		const field = issue.path.map(String).join('.');
		if (field && !(field in formatted)) {
			formatted[field] = issue.message;
		}
	}

	return formatted;
}
