import { z } from 'zod';
import { ASSIGNABLE_USER_ROLES } from '#lib/config/permissions.config.ts';
import { emailSchema, passwordSchema } from './common';
import { tarjetaMinimaSchema } from './tarjeta.schema';

const rolSchema = z.enum(ASSIGNABLE_USER_ROLES, { message: 'Elige el rol.' });

/** `POST /usuarios/`: empieza con el plan free; el rol, solo uno inferior al de quien crea */
export const usuarioCreateSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	rol: rolSchema
});

/** `PATCH /usuarios/{id}`: email y rol (plan, estado y contraseña van por otro camino) */
export const usuarioUpdateSchema = z.object({
	email: emailSchema.optional(),
	rol: rolSchema.optional()
});

/** `PATCH /usuarios/me` */
export const usuarioUpdateMeSchema = z.object({ email: emailSchema });

/**
 * `POST /auth/register`: la cuenta y su tarjeta en un paso. Siempre nace user, free y con el email
 * sin verificar; la tarjeta, en borrador.
 */
export const registroSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	tarjeta: tarjetaMinimaSchema
});
