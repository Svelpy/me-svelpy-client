import type {
	Tarjeta,
	TarjetaCertificacion,
	TarjetaContacto,
	TarjetaEducacion,
	TarjetaFaq,
	TarjetaSeccion,
	TarjetaSeo,
	TarjetaSocial,
	TarjetaTheme,
	TarjetaUbicacion,
	UbicacionHorario,
	Usuario,
	Vitrina,
	VitrinaCategoria,
	VitrinaItem,
	VitrinaItemImagen
} from '#lib/interfaces/index.ts';
import { Tabla, type FilaBase } from './storage';

/**
 * Esquema de la base de prueba: una tabla por cada tabla de `database-models.md`, con las mismas
 * columnas que la respuesta de la API más `is_deleted` (borrado lógico).
 */

export type UsuarioRow = Usuario & FilaBase & { password_hash: string };
/** El id es el access token */
export type SesionRow = FilaBase & { user_id: string; csrf_token: string; created_at: string };
export type TarjetaRow = Tarjeta & FilaBase;
export type TemaRow = TarjetaTheme & FilaBase;
export type SeoRow = TarjetaSeo & FilaBase;
export type SeccionRow = TarjetaSeccion & FilaBase;
export type ContactoRow = TarjetaContacto & FilaBase;
export type UbicacionRow = Omit<TarjetaUbicacion, 'horarios'> & FilaBase;
export type HorarioRow = UbicacionHorario & FilaBase;
export type SocialRow = TarjetaSocial & FilaBase;
export type VitrinaRow = Vitrina & FilaBase;
export type CategoriaRow = VitrinaCategoria & FilaBase;
export type ItemRow = Omit<VitrinaItem, 'imagenes'> & FilaBase;
export type ImagenRow = VitrinaItemImagen & FilaBase;
export type EducacionRow = TarjetaEducacion & FilaBase;
export type CertificacionRow = TarjetaCertificacion & FilaBase;
export type FaqRow = TarjetaFaq & FilaBase;

export const db = {
	usuarios: new Tabla<UsuarioRow>('usuario'),
	sesiones: new Tabla<SesionRow>('sesion'),
	tarjetas: new Tabla<TarjetaRow>('tarjeta'),
	temas: new Tabla<TemaRow>('tarjeta_theme'),
	seos: new Tabla<SeoRow>('tarjeta_seo'),
	secciones: new Tabla<SeccionRow>('tarjeta_seccion'),
	contactos: new Tabla<ContactoRow>('tarjeta_contacto'),
	ubicaciones: new Tabla<UbicacionRow>('tarjeta_ubicacion'),
	horarios: new Tabla<HorarioRow>('ubicacion_horario'),
	sociales: new Tabla<SocialRow>('tarjeta_social'),
	vitrinas: new Tabla<VitrinaRow>('vitrina'),
	categorias: new Tabla<CategoriaRow>('vitrina_categoria'),
	items: new Tabla<ItemRow>('vitrina_item'),
	imagenes: new Tabla<ImagenRow>('vitrina_item_imagen'),
	educacion: new Tabla<EducacionRow>('tarjeta_educacion'),
	certificaciones: new Tabla<CertificacionRow>('tarjeta_certificacion'),
	faq: new Tabla<FaqRow>('tarjeta_faq')
};

export type { FilaBase };
