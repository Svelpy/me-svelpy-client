import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaUbicacion } from '#lib/interfaces/index.ts';
import { tarjetaUbicacionSchema } from '#lib/zod/tarjetaUbicacion.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type UbicacionRow } from '../db/tablas';
import { aRespuestaHorario, horarioMock } from './ubicacionHorario.mock';

/** Modelo `tarjeta_ubicacion`: se crea y actualiza junto con sus horarios en una sola petición */

const base = crudHijo({
	tabla: db.ubicaciones,
	padre: 'tarjeta_id',
	schema: tarjetaUbicacionSchema,
	nombre: 'La ubicación',
	construir: (datos) => ({
		nombre: datos.nombre,
		direccion: datos.direccion,
		ciudad: datos.ciudad,
		departamento: datos.departamento,
		pais: datos.pais,
		maps_url: datos.maps_url,
		lat: datos.lat,
		lng: datos.lng,
		is_visible: datos.is_visible ?? true
	})
});

function horariosDe(cuerpo: unknown): unknown[] | undefined {
	if (typeof cuerpo !== 'object' || cuerpo === null || !('horarios' in cuerpo)) return undefined;
	return (cuerpo as { horarios?: unknown[] }).horarios;
}

function crear(tarjetaId: string, cuerpo: unknown): UbicacionRow {
	const fila = base.crear(tarjetaId, cuerpo);
	const horarios = horariosDe(cuerpo);
	if (horarios) horarioMock.reemplazar(fila.id, { horarios });
	return fila;
}

/** Si el cuerpo trae `horarios`, reemplazan a los anteriores */
function actualizar(id: string, cuerpo: unknown): UbicacionRow {
	const fila = base.actualizar(id, cuerpo);
	const horarios = horariosDe(cuerpo);
	if (horarios) horarioMock.reemplazar(id, { horarios });
	return fila;
}

function eliminar(id: string): void {
	base.eliminar(id);
	horarioMock.eliminarDelPadre(id);
}

function eliminarDelPadre(tarjetaId: string): void {
	for (const ubicacion of base.listar(tarjetaId)) eliminar(ubicacion.id);
}

export const ubicacionMock = { ...base, crear, actualizar, eliminar, eliminarDelPadre };

export const aRespuestaUbicacion = (fila: UbicacionRow): TarjetaUbicacion => ({
	...sinEliminado(fila),
	horarios: horarioMock.listar(fila.id).map(aRespuestaHorario)
});

export const ubicacionRutas = rutasHijo({
	coleccion: '/tarjetas/:id/ubicaciones',
	elemento: '/ubicaciones/:rid',
	module: Module.UBICACION,
	crud: ubicacionMock,
	aRespuesta: aRespuestaUbicacion,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
