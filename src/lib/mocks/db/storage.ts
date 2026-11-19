import { ErrorCode } from '#lib/interfaces/error.interface.ts';
import { AppError } from '#lib/services/error.service.ts';

/**
 * "Base de datos" de prueba: una tabla por clave de localStorage (`me::mock::<tabla>`), con el
 * contenido en JSON. Sin localStorage (tests de node) trabaja en memoria.
 */

const PREFIJO = 'me::mock::';

interface Almacen {
	getItem(clave: string): string | null;
	setItem(clave: string, valor: string): void;
	removeItem(clave: string): void;
	claves(): string[];
}

function almacenEnMemoria(): Almacen {
	const datos = new Map<string, string>();
	return {
		getItem: (clave) => datos.get(clave) ?? null,
		setItem: (clave, valor) => void datos.set(clave, valor),
		removeItem: (clave) => void datos.delete(clave),
		claves: () => [...datos.keys()]
	};
}

function almacenLocal(): Almacen | null {
	try {
		if (typeof localStorage === 'undefined') return null;
		return {
			getItem: (clave) => localStorage.getItem(clave),
			setItem: (clave, valor) => localStorage.setItem(clave, valor),
			removeItem: (clave) => localStorage.removeItem(clave),
			claves: () =>
				Array.from({ length: localStorage.length }, (_, indice) => localStorage.key(indice)).filter(
					(clave): clave is string => clave !== null
				)
		};
	} catch {
		return null;
	}
}

let almacen: Almacen = almacenLocal() ?? almacenEnMemoria();

/** Filas leídas, por clave: cada tabla se parsea una sola vez por carga de la app */
const cache = new Map<string, FilaBase[]>();

/** Para tests: arranca con una base vacía en memoria */
export function usarAlmacenEnMemoria(): void {
	almacen = almacenEnMemoria();
	cache.clear();
}

export function leerValor(clave: string): string | null {
	return almacen.getItem(PREFIJO + clave);
}

export function guardarValor(clave: string, valor: string): void {
	almacen.setItem(PREFIJO + clave, valor);
}

/** Borra todas las tablas de prueba (no toca la sesión ni el resto del localStorage) */
export function borrarTodo(): void {
	for (const clave of almacen.claves()) if (clave.startsWith(PREFIJO)) almacen.removeItem(clave);
	cache.clear();
}

export interface FilaBase {
	id: string;
	/** Borrado lógico: la fila se conserva pero ninguna consulta la devuelve */
	is_deleted: boolean;
}

// Transacción en curso: tablas modificadas y su estado previo para deshacer
let transaccion: Map<Tabla<FilaBase>, FilaBase[]> | null = null;

function esErrorDeCuota(error: unknown): boolean {
	return (
		error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)
	);
}

const ERROR_CUOTA = () =>
	new AppError({
		message:
			'El almacenamiento de los datos de prueba está lleno. Usa imágenes más livianas o restablece los datos de prueba.',
		code: ErrorCode.APP_ERROR,
		status: 413
	});

export class Tabla<T extends FilaBase> {
	constructor(readonly nombre: string) {}

	private get clave(): string {
		return PREFIJO + this.nombre;
	}

	/** Todas las filas, también las eliminadas */
	todas(): T[] {
		if (!cache.has(this.clave)) {
			const crudo = almacen.getItem(this.clave);
			cache.set(this.clave, crudo ? (JSON.parse(crudo) as T[]) : []);
		}
		return cache.get(this.clave) as T[];
	}

	/** Filas no eliminadas */
	activas(): T[] {
		return this.todas().filter((fila) => !fila.is_deleted);
	}

	buscar(id: string): T | undefined {
		return this.activas().find((fila) => fila.id === id);
	}

	donde(condicion: (fila: T) => boolean): T[] {
		return this.activas().filter(condicion);
	}

	insertar(fila: T): T {
		this.registrarCambio();
		this.todas().push(fila);
		this.guardar();
		return fila;
	}

	actualizar(id: string, cambios: Partial<T>): T {
		const fila = this.todas().find((f) => f.id === id);
		if (!fila) throw new Error(`Fila ${id} inexistente en ${this.nombre}`);
		this.registrarCambio();
		Object.assign(fila, cambios);
		this.guardar();
		return fila;
	}

	/** Borrado lógico */
	eliminar(id: string, extra: Partial<T> = {}): void {
		this.actualizar(id, { ...extra, is_deleted: true } as Partial<T>);
	}

	private registrarCambio(): void {
		if (transaccion && !transaccion.has(this as unknown as Tabla<FilaBase>)) {
			transaccion.set(this as unknown as Tabla<FilaBase>, structuredClone(this.todas()));
		}
	}

	guardar(): void {
		if (transaccion) return; // se escribe al confirmar
		try {
			almacen.setItem(this.clave, JSON.stringify(this.todas()));
		} catch (error) {
			if (esErrorDeCuota(error)) throw ERROR_CUOTA();
			throw error;
		}
	}

	/** Deshace los cambios en memoria (lo usa la transacción) */
	restaurar(filas: T[]): void {
		cache.set(this.clave, filas);
	}
}

/**
 * Ejecuta varias escrituras como una sola: si algo falla (validación, conflicto o cuota llena),
 * todas las tablas vuelven a como estaban y nada queda a medias, igual que una transacción SQL.
 */
export function enTransaccion<R>(operacion: () => R): R {
	if (transaccion) return operacion(); // ya dentro de una
	const previas = new Map<Tabla<FilaBase>, FilaBase[]>();
	transaccion = previas;
	let resultado: R;
	try {
		resultado = operacion();
	} catch (error) {
		transaccion = null;
		deshacer(previas);
		throw error;
	}
	transaccion = null;
	try {
		for (const tabla of previas.keys()) tabla.guardar();
	} catch (error) {
		deshacer(previas);
		throw error;
	}
	return resultado;
}

function deshacer(previas: Map<Tabla<FilaBase>, FilaBase[]>): void {
	for (const [tabla, filas] of previas) {
		tabla.restaurar(filas);
		try {
			tabla.guardar();
		} catch {
			// Si ni el estado anterior entra, queda en memoria hasta la próxima escritura
		}
	}
}
