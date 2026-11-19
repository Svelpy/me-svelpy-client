import { Module } from '#lib/config/permissions.config.ts';
import type { UbicacionHorario } from '#lib/interfaces/index.ts';
import { aMinutos, buscarSolape, horaCorta } from '#lib/utils/horarios.ts';
import {
	ubicacionHorarioSchema,
	ubicacionHorariosUpdateSchema
} from '#lib/zod/tarjetaUbicacion.schema.ts';
import {
	Action,
	ahora,
	error,
	exigirAccesoTarjeta,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	sinEliminado,
	tocarTarjeta,
	validar,
	type RutaMock
} from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { enTransaccion } from '../db/storage';
import { db, type HorarioRow } from '../db/tablas';

/** Modelo `ubicacion_horario`: franjas por día, sin cruces dentro del mismo día */

const base = crudHijo({
	tabla: db.horarios,
	padre: 'ubicacion_id',
	schema: ubicacionHorarioSchema,
	nombre: 'El horario',
	sinActualizado: true,
	sinOrden: true,
	construir: (datos) => ({
		dia_semana: datos.dia_semana,
		hora_inicio: horaCorta(datos.hora_inicio),
		hora_fin: horaCorta(datos.hora_fin)
	}),
	unico: (datos, ubicacionId, idActual) => {
		const otros = db.horarios.donde((h) => h.ubicacion_id === ubicacionId && h.id !== idActual);
		return buscarSolape([...otros, datos])
			? { campo: 'hora_inicio', mensaje: 'Se cruza con otro horario del mismo día.' }
			: null;
	}
});

function listar(ubicacionId: string): HorarioRow[] {
	return base
		.listar(ubicacionId)
		.sort(
			(a, b) => a.dia_semana - b.dia_semana || aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio)
		);
}

/** Reemplaza la semana completa de una ubicación */
function reemplazar(ubicacionId: string, cuerpo: unknown): HorarioRow[] {
	const { horarios } = validar(ubicacionHorariosUpdateSchema, cuerpo);
	base.eliminarDelPadre(ubicacionId);
	const marca = ahora();
	for (const franja of horarios) {
		db.horarios.insertar({
			id: nuevoId(),
			ubicacion_id: ubicacionId,
			dia_semana: franja.dia_semana,
			hora_inicio: horaCorta(franja.hora_inicio),
			hora_fin: horaCorta(franja.hora_fin),
			created_at: marca,
			is_deleted: false
		});
	}
	return listar(ubicacionId);
}

export const horarioMock = { ...base, listar, reemplazar };

export const aRespuestaHorario = (fila: HorarioRow): UbicacionHorario => sinEliminado(fila);

function tarjetaDeUbicacion(ubicacionId: string): string {
	const ubicacion = db.ubicaciones.buscar(ubicacionId);
	if (!ubicacion) throw error.noEncontrado('La ubicación no existe.');
	return ubicacion.tarjeta_id;
}

export const horarioRutas: RutaMock[] = [
	...rutasHijo({
		coleccion: '/ubicaciones/:id/horarios',
		elemento: '/horarios/:rid',
		module: Module.UBICACION,
		crud: horarioMock,
		aRespuesta: aRespuestaHorario,
		tarjetaDelPadre: tarjetaDeUbicacion,
		padreDeFila: (fila) => fila.ubicacion_id,
		sinOrden: true,
		sinEditar: true
	}),
	{
		metodo: 'PUT',
		patron: '/ubicaciones/:id/horarios',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.UBICACION, Action.UPDATE);
			const tarjetaId = tarjetaDeUbicacion(ctx.params.id);
			exigirAccesoTarjeta(sesion, tarjetaId);
			const filas = enTransaccion(() => reemplazar(ctx.params.id, ctx.cuerpo));
			tocarTarjeta(tarjetaId);
			return filas.map(aRespuestaHorario);
		}
	}
];
