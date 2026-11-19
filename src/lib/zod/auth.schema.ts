import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const signInSchema = z.object({
	email: emailSchema,
	password: z
		.string({ message: 'Ingresa tu contraseña.' })
		.min(1, { message: 'Ingresa tu contraseña.' })
});

/** Cuerpo de `PATCH /users/me/password` */
export const cambiarPasswordRequestSchema = z.object({
	password_actual: z
		.string({ message: 'Ingresa tu contraseña actual.' })
		.min(1, { message: 'Ingresa tu contraseña actual.' }),
	password_nueva: passwordSchema
});

/** Formulario de "Mi cuenta": además pide repetir la contraseña nueva (no se envía a la API) */
export const cambiarPasswordSchema = cambiarPasswordRequestSchema
	.extend({
		confirmar: z.string().min(1, { message: 'Repite la contraseña nueva.' })
	})
	.refine((datos) => datos.password_nueva === datos.confirmar, {
		message: 'Las contraseñas no coinciden.',
		path: ['confirmar']
	})
	.refine((datos) => datos.password_nueva !== datos.password_actual, {
		message: 'La contraseña nueva debe ser distinta de la actual.',
		path: ['password_nueva']
	});
