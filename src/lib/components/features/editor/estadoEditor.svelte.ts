import { getContext, setContext } from 'svelte';
import type { SeccionClave, TarjetaCompleta } from '#lib/interfaces/index.ts';

/** Paneles del editor: los de la tarjeta y uno por cada sección */
export type PanelEditor = 'perfil' | 'apariencia' | 'compartir' | 'seo' | SeccionClave;

export const PANELES_TARJETA = ['perfil', 'apariencia', 'compartir', 'seo'] as const;

type ListaTarjeta =
	'contactos' | 'ubicaciones' | 'sociales' | 'educacion' | 'certificaciones' | 'faq';

/**
 * Estado del editor de una tarjeta. Lo comparten el owner (su tarjeta) y el superadmin (cualquiera):
 * - `tarjeta`: lo guardado (la última respuesta del servidor).
 * - `borrador`: los cambios sin guardar del panel abierto; el espejo los muestra al instante.
 */
export class EditorTarjeta {
	tarjeta = $state() as TarjetaCompleta;
	borrador = $state<Partial<TarjetaCompleta> | null>(null);
	/** Hay cambios sin guardar en el panel abierto */
	sinGuardar = $state(false);

	/** Lo que muestra el espejo: lo guardado más el borrador */
	vistaPrevia = $derived<TarjetaCompleta>(
		this.borrador ? { ...this.tarjeta, ...this.borrador } : this.tarjeta
	);

	readonly modo: 'owner' | 'admin';
	private readonly alCambiar: (tarjeta: TarjetaCompleta) => void;

	constructor(
		inicial: TarjetaCompleta,
		modo: 'owner' | 'admin',
		alCambiar: (tarjeta: TarjetaCompleta) => void = () => {}
	) {
		this.tarjeta = inicial;
		this.modo = modo;
		this.alCambiar = alCambiar;
	}

	/** Aplica lo que devolvió el servidor (no toca el borrador del panel abierto) */
	actualizar(cambios: Partial<TarjetaCompleta>): void {
		this.tarjeta = { ...this.tarjeta, ...cambios };
		this.alCambiar(this.tarjeta);
	}

	/** Tras guardar el panel: lo guardado ya es lo que se ve */
	guardado(cambios: Partial<TarjetaCompleta>): void {
		this.actualizar(cambios);
		this.previsualizar(null, false);
	}

	/** Reemplaza un elemento de una lista (o lo agrega al final si es nuevo) */
	guardarEnLista<K extends ListaTarjeta>(clave: K, elemento: TarjetaCompleta[K][number]): void {
		const lista = this.tarjeta[clave] as { id: string }[];
		const existe = lista.some((item) => item.id === elemento.id);
		const nueva = existe
			? lista.map((item) => (item.id === elemento.id ? elemento : item))
			: [...lista, elemento];
		this.actualizar({ [clave]: nueva } as Partial<TarjetaCompleta>);
	}

	quitarDeLista(clave: ListaTarjeta, id: string): void {
		const lista = this.tarjeta[clave] as { id: string }[];
		this.actualizar({
			[clave]: lista.filter((item) => item.id !== id)
		} as Partial<TarjetaCompleta>);
	}

	/** Muestra cambios sin guardar en el espejo */
	previsualizar(cambios: Partial<TarjetaCompleta> | null, sinGuardar: boolean): void {
		this.borrador = cambios;
		this.sinGuardar = sinGuardar;
	}
}

const CLAVE = Symbol('editor-tarjeta');

export function setEditor(editor: EditorTarjeta): EditorTarjeta {
	return setContext(CLAVE, editor);
}

export function getEditor(): EditorTarjeta {
	return getContext<EditorTarjeta>(CLAVE);
}
