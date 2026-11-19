import { z } from 'zod';
import { ASSIGNABLE_USER_ROLES } from '#lib/config/permissions.config.ts';
import { emailSchema, passwordSchema } from './common';
import { tarjetaNuevaSchema } from './tarjeta.schema';

const rolSchema = z.enum(ASSIGNABLE_USER_ROLES, { message: 'Elige el rol.' });

/** `POST /usuarios`: con `tarjeta` se crea también su tarjeta en la misma petición */
export const usuarioCreateSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	rol: rolSchema,
	is_active: z.boolean().optional(),
	tarjeta: tarjetaNuevaSchema.optional()
});

/** `PATCH /usuarios/{id}` */
export const usuarioUpdateSchema = z.object({
	email: emailSchema.optional(),
	rol: rolSchema.optional(),
	is_active: z.boolean().optional()
});

/** `PUT /usuarios/{id}/password` */
export const usuarioPasswordSchema = z.object({ password: passwordSchema });
