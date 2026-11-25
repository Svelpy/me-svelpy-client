/**
 * Máximos que acepta la API por tarjeta (`maxItems` del OpenAPI). Los usan los esquemas zod y el
 * editor, que desactiva "Agregar" al llegar al tope y explica por qué.
 */
export const LIMITES_TARJETA = {
	contactos: 10,
	ubicaciones: 10,
	/** Franjas de atención por ubicación */
	horarios: 21,
	redes: 24,
	educaciones: 10,
	certificaciones: 10,
	faqs: 30,
	categorias: 10,
	items: 25,
	/** Imágenes por ítem de la vitrina */
	imagenes: 3
} as const;

export type ListaConLimite = keyof typeof LIMITES_TARJETA;
