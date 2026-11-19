import { z, type ZodType } from 'zod';
import type { Module } from '#lib/config/permissions.config.ts';
import {
	Action,
	ahora,
	error,
	exigirAccesoTarjeta,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	porOrden,
	siguienteOrden,
	tocarTarjeta,
	validar,
	type RutaMock
} from './contexto';
import { enTransaccion, type Tabla } from './storage';
import type { FilaBase } from './tablas';

/**
 * CRUD de una lista que cuelga de un padre (contactos de una tarjeta, horarios de una ubicación,
 * imágenes de un ítem…): listar, obtener, crear, actualizar, eliminar (lógico) y reordenar.
 * Cada modelo lo configura en su propio archivo.
 */

export interface FilaHija extends FilaBase {
	orden?: number;
	created_at: string;
}

type CamposAutomaticos = 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'orden';

export interface ConfigCrudHijo<Row extends FilaHija, Datos> {
	tabla: Tabla<Row>;
	/** Columna que apunta al padre */
	padre: keyof Row & string;
	schema: ZodType<Datos>;
	/** "El contacto", para los mensajes */
	nombre: string;
	/** Columnas propias a partir de los datos validados (sin id, padre, orden ni fechas) */
	construir: (datos: Datos) => Partial<Omit<Row, CamposAutomaticos>>;
	/** Conflicto de unicidad: campo y mensaje, o null */
	unico?: (
		datos: Datos,
		padreId: string,
		idActual?: string
	) => { campo: string; mensaje: string } | null;
	/** Ajustes tras crear o actualizar (p. ej. un solo contacto principal por tipo) */
	despues?: (fila: Row) => void;
	/** La tabla no tiene `updated_at` (ubicacion_horario, vitrina_item_imagen) */
	sinActualizado?: boolean;
	/** La tabla no tiene `orden` (ubicacion_horario) */
	sinOrden?: boolean;
}

const reordenarSchema = z.object({
	ids: z.array(z.string()).min(1, { message: 'Envía los elementos en el orden nuevo.' })
});

export function crudHijo<Row extends FilaHija, Datos>(config: ConfigCrudHijo<Row, Datos>) {
	const { tabla, padre } = config;

	const ordenar = (filas: Row[]) =>
		config.sinOrden ? filas : (filas as (Row & { orden: number })[]).sort(porOrden);

	function listar(padreId: string): Row[] {
		return ordenar(tabla.donde((fila) => fila[padre] === padreId));
	}

	function obtener(id: string): Row {
		const fila = tabla.buscar(id);
		if (!fila) throw error.noEncontrado(`${config.nombre} no existe.`);
		return fila;
	}

	function comprobarUnico(datos: Datos, padreId: string, idActual?: string) {
		const choque = config.unico?.(datos, padreId, idActual);
		if (choque) throw error.conflicto(choque.mensaje, { [choque.campo]: choque.mensaje });
	}

	function crear(padreId: string, cuerpo: unknown): Row {
		const datos = validar(config.schema, cuerpo);
		comprobarUnico(datos, padreId);
		const marca = ahora();
		const fila = {
			...config.construir(datos),
			[padre]: padreId,
			id: nuevoId(),
			...(config.sinOrden ? {} : { orden: siguienteOrden(listar(padreId) as { orden: number }[]) }),
			created_at: marca,
			...(config.sinActualizado ? {} : { updated_at: marca }),
			is_deleted: false
		} as unknown as Row;
		tabla.insertar(fila);
		config.despues?.(fila);
		return fila;
	}

	/** Valida la fila completa (lo guardado + los cambios), como un PATCH del backend */
	function actualizar(id: string, cuerpo: unknown): Row {
		const actual = obtener(id);
		const cambios = typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {};
		const datos = validar(config.schema, { ...actual, ...cambios });
		comprobarUnico(datos, String(actual[padre]), id);
		const fila = tabla.actualizar(id, {
			...config.construir(datos),
			...(config.sinActualizado ? {} : { updated_at: ahora() })
		} as Partial<Row>);
		config.despues?.(fila);
		return fila;
	}

	function eliminar(id: string): void {
		obtener(id);
		tabla.eliminar(id);
	}

	function eliminarDelPadre(padreId: string): void {
		for (const fila of listar(padreId)) tabla.eliminar(fila.id);
	}

	/** Recibe todos los ids del padre en el orden nuevo */
	function reordenar(padreId: string, cuerpo: unknown): Row[] {
		const { ids } = validar(reordenarSchema, cuerpo);
		const actuales = listar(padreId);
		const mismos =
			ids.length === actuales.length &&
			new Set(ids).size === ids.length &&
			actuales.every((fila) => ids.includes(fila.id));
		if (!mismos)
			throw error.validacion({ ids: 'Envía todos los elementos de la lista, sin repetir.' });
		ids.forEach((id, orden) => tabla.actualizar(id, { orden } as Partial<Row>));
		return listar(padreId);
	}

	return { listar, obtener, crear, actualizar, eliminar, eliminarDelPadre, reordenar };
}

export type CrudHijo<Row extends FilaHija> = ReturnType<typeof crudHijo<Row, never>>;

interface OpcionesRutas<Row extends FilaHija> {
	/** Colección bajo el padre, con `:id` = padre: '/tarjetas/:id/contactos' */
	coleccion: string;
	/** Un elemento, con `:rid`: '/contactos/:rid' */
	elemento: string;
	module: Module;
	crud: Pick<
		CrudHijo<Row>,
		'listar' | 'obtener' | 'crear' | 'actualizar' | 'eliminar' | 'reordenar'
	>;
	aRespuesta: (fila: Row) => unknown;
	/** Tarjeta dueña del padre (control de acceso) */
	tarjetaDelPadre: (padreId: string) => string;
	/** Padre de una fila */
	padreDeFila: (fila: Row) => string;
	/** Sin `PUT {coleccion}/orden` ni `PATCH {elemento}` */
	sinOrden?: boolean;
	sinEditar?: boolean;
}

/** Rutas REST de una lista hija: GET y POST en la colección, PUT …/orden, PATCH y DELETE del elemento */
export function rutasHijo<Row extends FilaHija>(opciones: OpcionesRutas<Row>): RutaMock[] {
	const { crud, module, aRespuesta, tarjetaDelPadre, padreDeFila } = opciones;

	const rutas: RutaMock[] = [
		{
			metodo: 'GET',
			patron: opciones.coleccion,
			manejar: (ctx) => {
				const sesion = exigirSesion(ctx);
				exigirPermiso(sesion, module, Action.READ);
				exigirAccesoTarjeta(sesion, tarjetaDelPadre(ctx.params.id));
				return crud.listar(ctx.params.id).map(aRespuesta);
			}
		},
		{
			metodo: 'POST',
			patron: opciones.coleccion,
			manejar: (ctx) => {
				const sesion = exigirSesion(ctx);
				exigirPermiso(sesion, module, Action.CREATE);
				const tarjetaId = tarjetaDelPadre(ctx.params.id);
				exigirAccesoTarjeta(sesion, tarjetaId);
				const fila = enTransaccion(() => crud.crear(ctx.params.id, ctx.cuerpo));
				tocarTarjeta(tarjetaId);
				return aRespuesta(fila);
			}
		},
		{
			metodo: 'DELETE',
			patron: opciones.elemento,
			manejar: (ctx) => {
				const sesion = exigirSesion(ctx);
				exigirPermiso(sesion, module, Action.DELETE);
				const tarjetaId = tarjetaDelPadre(padreDeFila(crud.obtener(ctx.params.rid)));
				exigirAccesoTarjeta(sesion, tarjetaId);
				enTransaccion(() => crud.eliminar(ctx.params.rid));
				tocarTarjeta(tarjetaId);
				return {};
			}
		}
	];

	if (!opciones.sinEditar) {
		rutas.push({
			metodo: 'PATCH',
			patron: opciones.elemento,
			manejar: (ctx) => {
				const sesion = exigirSesion(ctx);
				exigirPermiso(sesion, module, Action.UPDATE);
				const tarjetaId = tarjetaDelPadre(padreDeFila(crud.obtener(ctx.params.rid)));
				exigirAccesoTarjeta(sesion, tarjetaId);
				const fila = enTransaccion(() => crud.actualizar(ctx.params.rid, ctx.cuerpo));
				tocarTarjeta(tarjetaId);
				return aRespuesta(fila);
			}
		});
	}

	if (!opciones.sinOrden) {
		rutas.push({
			metodo: 'PUT',
			patron: `${opciones.coleccion}/orden`,
			manejar: (ctx) => {
				const sesion = exigirSesion(ctx);
				exigirPermiso(sesion, module, Action.UPDATE);
				const tarjetaId = tarjetaDelPadre(ctx.params.id);
				exigirAccesoTarjeta(sesion, tarjetaId);
				const filas = enTransaccion(() => crud.reordenar(ctx.params.id, ctx.cuerpo));
				tocarTarjeta(tarjetaId);
				return filas.map(aRespuesta);
			}
		});
	}

	return rutas;
}
