import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const signInSchema = z.object({
	email: emailSchema,
	password: z
		.string({ message: 'Ingresa tu contraseña.' })
		.min(1, { message: 'Ingresa tu contraseña.' })
});

/** Cuerpo de `POST /auth/change-password` */
export const cambiarPasswordRequestSchema = z.object({
	current_password: z
		.string({ message: 'Ingresa tu contraseña actual.' })
		.min(1, { message: 'Ingresa tu contraseña actual.' }),
	new_password: passwordSchema
});

/** Formulario de "Mi cuenta": además pide repetir la contraseña nueva (no se envía a la API) */
export const cambiarPasswordSchema = cambiarPasswordRequestSchema
	.extend({
		confirmar: z.string().min(1, { message: 'Repite la contraseña nueva.' })
	})
	.refine((datos) => datos.new_password === datos.confirmar, {
		message: 'Las contraseñas no coinciden.',
		path: ['confirmar']
	})
	.refine((datos) => datos.new_password !== datos.current_password, {
		message: 'La contraseña nueva debe ser distinta de la actual.',
		path: ['new_password']
	});

/** `POST /auth/forgot-password` */
export const olvidePasswordSchema = z.object({ email: emailSchema });

/** Formulario de `/auth/reset-password`: la nueva y su confirmación (el token llega en la URL) */
export const restablecerPasswordSchema = z
	.object({
		new_password: passwordSchema,
		confirmar: z.string().min(1, { message: 'Repite la contraseña nueva.' })
	})
	.refine((datos) => datos.new_password === datos.confirmar, {
		message: 'Las contraseñas no coinciden.',
		path: ['confirmar']
	});
