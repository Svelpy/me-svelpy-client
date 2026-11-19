import { z } from 'zod';
import { booleanoOpcional, slugSchema, texto, textoOpcional, urlImagenOpcional } from './common';
import { tarjetaContactoSchema } from './tarjetaContacto.schema';
import {
	tarjetaCertificacionSchema,
	tarjetaEducacionSchema,
	tarjetaFaqSchema
} from './tarjetaFormacion.schema';
import { tarjetaSocialSchema } from './tarjetaSocial.schema';
import {
	tarjetaSeccionInputSchema,
	tarjetaSeoSchema,
	tarjetaThemeSchema
} from './tarjetaTheme.schema';
import { tarjetaUbicacionSchema } from './tarjetaUbicacion.schema';
import { vitrinaNuevaSchema } from './vitrina.schema';

export const NOMBRE_EMPRESA_POSICIONES = [
	'arriba',
	'abajo',
	'izquierda',
	'derecha',
	'oculto'
] as const;

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

/** `PATCH /tarjetas/{id}` (el backend valida el resultado completo) */
export const tarjetaEditarSchema = tarjetaDatosSchema.extend({ slug: slugSchema });

/**
 * Tarjeta nueva con todo su contenido (`POST /tarjetas/mia`, `POST /usuarios` con `tarjeta`).
 * Cada lista se valida con el mismo esquema que usa su formulario en el editor.
 */
export const tarjetaNuevaSchema = tarjetaEditarSchema.extend({
	is_public: booleanoOpcional(),
	theme: tarjetaThemeSchema.partial().optional(),
	seo: tarjetaSeoSchema.partial().optional(),
	secciones: z.array(tarjetaSeccionInputSchema).max(9).optional(),
	contactos: z.array(tarjetaContactoSchema).max(30, { message: 'Hasta 30 contactos.' }).optional(),
	ubicaciones: z
		.array(tarjetaUbicacionSchema)
		.max(20, { message: 'Hasta 20 ubicaciones.' })
		.optional(),
	sociales: z.array(tarjetaSocialSchema).max(30, { message: 'Hasta 30 redes.' }).optional(),
	vitrina: vitrinaNuevaSchema.optional(),
	educacion: z.array(tarjetaEducacionSchema).max(30).optional(),
	certificaciones: z.array(tarjetaCertificacionSchema).max(30).optional(),
	faq: z.array(tarjetaFaqSchema).max(30).optional()
});

/** `POST /tarjetas` (superadmin) */
export const tarjetaCreateSchema = tarjetaNuevaSchema.extend({
	user_id: z.string({ message: 'Elige el usuario.' }).min(1, { message: 'Elige el usuario.' })
});
