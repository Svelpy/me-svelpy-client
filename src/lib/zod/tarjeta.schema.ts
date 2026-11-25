import { z } from 'zod';
import { TEMA_PRESETS } from '#lib/config/temasTarjeta.config.ts';
import { LIMITES_TARJETA } from '#lib/constants/limites.ts';
import type { TemaPreset } from '#lib/interfaces/index.ts';
import { slugSchema, texto, textoOpcional, urlImagenOpcional } from './common';
import { tarjetaContactoSchema } from './tarjetaContacto.schema';
import { tarjetaSocialSchema } from './tarjetaSocial.schema';

export const NOMBRE_EMPRESA_POSICIONES = [
	'arriba',
	'abajo',
	'izquierda',
	'derecha',
	'oculto'
] as const;

export const presetSchema = z.enum(TEMA_PRESETS as [TemaPreset, ...TemaPreset[]], {
	message: 'Elige un tema.'
});

/** Datos propios de la tarjeta (sin slug ni contenido anidado) */
export const tarjetaDatosSchema = z.object({
	rubro: texto('El rubro', 150),
	prefijo: textoOpcional('El prefijo', 30),
	nombres: texto('El nombre', 150),
	apellidos: textoOpcional('Los apellidos', 150),
	cargo: textoOpcional('El cargo', 150),
	nombre_empresa: textoOpcional('La empresa', 200),
	acerca_de_mi: textoOpcional('El texto', 1500),
	profile_url: urlImagenOpcional('La foto de perfil'),
	photo_usuario_url: urlImagenOpcional('La foto para la agenda'),
	logo_empresa_url: urlImagenOpcional('El logo'),
	cover_url: urlImagenOpcional('La portada'),
	qr_pago_url: urlImagenOpcional('El QR de pago'),
	nombre_empresa_posicion: z.enum(NOMBRE_EMPRESA_POSICIONES).optional()
});

/** `PATCH /tarjetas/{id}` con los datos de la tarjeta (el slug solo lo cambian los admins) */
export const tarjetaEditarSchema = tarjetaDatosSchema.extend({ slug: slugSchema });

/** Lo mínimo para empezar: lo que pide el registro (`TarjetaRegistro`) y "Crear tarjeta" */
export const tarjetaMinimaSchema = z.object({
	slug: slugSchema,
	rubro: texto('El rubro', 150),
	nombres: texto('El nombre', 150),
	prefijo: textoOpcional('El prefijo', 30),
	apellidos: textoOpcional('Los apellidos', 150),
	cargo: textoOpcional('El cargo', 150),
	theme: z.object({ preset: presetSchema }).optional()
});

/**
 * `POST /tarjetas/` con contactos y redes en la misma petición (alta de una cuenta con su tarjeta).
 * Cada lista se valida con el mismo esquema que usa su formulario en el editor.
 */
export const tarjetaNuevaSchema = tarjetaMinimaSchema.extend({
	contactos: z
		.array(tarjetaContactoSchema)
		.max(LIMITES_TARJETA.contactos, {
			message: `Hasta ${LIMITES_TARJETA.contactos} contactos.`
		})
		.optional(),
	redes: z
		.array(tarjetaSocialSchema)
		.max(LIMITES_TARJETA.redes, { message: `Hasta ${LIMITES_TARJETA.redes} redes.` })
		.optional()
});

/** `POST /tarjetas/` de un admin para otra cuenta */
export const tarjetaCreateSchema = tarjetaNuevaSchema.extend({
	user_id: z.string({ message: 'Elige la cuenta.' }).min(1, { message: 'Elige la cuenta.' })
});
