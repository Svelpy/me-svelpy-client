import type {
	TarjetaCertificacionNestedItem,
	TarjetaContactoNestedItem,
	TarjetaEducacionNestedItem,
	TarjetaFaqNestedItem,
	TarjetaSeccion,
	TarjetaSeccionNestedItem,
	TarjetaSocialNestedItem,
	TarjetaUbicacionNestedItem,
	VitrinaCategoriaNestedItem,
	VitrinaItemNestedItem
} from '#lib/interfaces/index.ts';

/**
 * De lo que devuelve la API (o arma un formulario) a lo que acepta en las listas de un PATCH
 * (`*NestedItem`). La API rechaza cualquier campo de más (`created_at`, `tarjeta_id`…), así que
 * cada mapeador elige los campos uno por uno. Sin id = elemento nuevo.
 */

export function contactoNested(c: TarjetaContactoNestedItem): TarjetaContactoNestedItem {
	return {
		id: c.id ?? null,
		tipo: c.tipo,
		valor: c.valor,
		etiqueta: c.etiqueta ?? null,
		is_wpp: c.tipo === 'phone' ? (c.is_wpp ?? false) : false,
		is_primary: c.is_primary ?? false,
		is_visible: c.is_visible ?? true,
		orden: c.orden ?? 0
	};
}

export function redNested(r: TarjetaSocialNestedItem): TarjetaSocialNestedItem {
	return {
		id: r.id ?? null,
		red: r.red,
		url: r.url,
		username: r.username ?? null,
		is_visible: r.is_visible ?? true,
		orden: r.orden ?? 0
	};
}

export function ubicacionNested(u: TarjetaUbicacionNestedItem): TarjetaUbicacionNestedItem {
	return {
		id: u.id ?? null,
		nombre: u.nombre ?? null,
		direccion: u.direccion,
		ciudad: u.ciudad ?? null,
		departamento: u.departamento ?? null,
		pais: u.pais ?? null,
		maps_url: u.maps_url ?? null,
		lat: u.lat ?? null,
		lng: u.lng ?? null,
		is_visible: u.is_visible ?? true,
		orden: u.orden ?? 0,
		horarios: (u.horarios ?? []).map((h) => ({
			id: h.id ?? null,
			dia_semana: h.dia_semana,
			// La API devuelve "08:30" o "08:30:00"; se envía siempre HH:MM
			hora_inicio: h.hora_inicio.slice(0, 5),
			hora_fin: h.hora_fin.slice(0, 5)
		}))
	};
}

export function educacionNested(e: TarjetaEducacionNestedItem): TarjetaEducacionNestedItem {
	const actual = e.is_actual ?? false;
	return {
		id: e.id ?? null,
		institucion: e.institucion,
		titulo: e.titulo ?? null,
		area_estudio: e.area_estudio ?? null,
		descripcion: e.descripcion ?? null,
		fecha_inicio: e.fecha_inicio ?? null,
		fecha_fin: actual ? null : (e.fecha_fin ?? null),
		is_actual: actual,
		is_visible: e.is_visible ?? true,
		orden: e.orden ?? 0
	};
}

export function certificacionNested(
	c: TarjetaCertificacionNestedItem
): TarjetaCertificacionNestedItem {
	const noExpira = c.no_expira ?? false;
	return {
		id: c.id ?? null,
		nombre: c.nombre,
		entidad_emisora: c.entidad_emisora ?? null,
		codigo_credencial: c.codigo_credencial ?? null,
		url_credencial: c.url_credencial ?? null,
		fecha_emision: c.fecha_emision ?? null,
		fecha_expiracion: noExpira ? null : (c.fecha_expiracion ?? null),
		no_expira: noExpira,
		descripcion: c.descripcion ?? null,
		is_visible: c.is_visible ?? true,
		orden: c.orden ?? 0
	};
}

export function faqNested(f: TarjetaFaqNestedItem): TarjetaFaqNestedItem {
	return {
		id: f.id ?? null,
		pregunta: f.pregunta,
		respuesta: f.respuesta,
		is_visible: f.is_visible ?? true,
		orden: f.orden ?? 0
	};
}

export function seccionNested(
	s: Pick<TarjetaSeccion, 'id' | 'titulo' | 'is_visible' | 'orden'>
): TarjetaSeccionNestedItem {
	return { id: s.id, titulo: s.titulo, is_visible: s.is_visible, orden: s.orden };
}

export function categoriaNested(c: VitrinaCategoriaNestedItem): VitrinaCategoriaNestedItem {
	return {
		id: c.id ?? null,
		nombre: c.nombre,
		is_visible: c.is_visible ?? true,
		orden: c.orden ?? 0
	};
}

export function itemNested(i: VitrinaItemNestedItem): VitrinaItemNestedItem {
	return {
		id: i.id ?? null,
		categoria_id: i.categoria_id ?? null,
		titulo: i.titulo,
		descripcion: i.descripcion ?? null,
		precio: i.precio ?? null,
		precio_anterior: i.precio_anterior ?? null,
		precio_etiqueta: i.precio_etiqueta ?? null,
		campo1: i.campo1 ?? null,
		campo2: i.campo2 ?? null,
		campo3: i.campo3 ?? null,
		campo4: i.campo4 ?? null,
		destacado: i.destacado ?? false,
		is_visible: i.is_visible ?? true,
		orden: i.orden ?? 0,
		imagenes: (i.imagenes ?? []).map((imagen, indice) => ({
			id: imagen.id ?? null,
			url: imagen.url,
			alt: imagen.alt ?? null,
			orden: indice
		}))
	};
}

/** La lista con `orden` igual a su posición (así se guarda el orden que se ve) */
export function conOrden<T extends { orden?: number }>(lista: T[]): T[] {
	return lista.map((elemento, indice) =>
		elemento.orden === indice ? elemento : { ...elemento, orden: indice }
	);
}
