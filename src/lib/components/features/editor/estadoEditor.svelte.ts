import { getContext, setContext } from 'svelte';
import { bloqueoPublicacion } from '#lib/config/planes.config.ts';
import { LIMITES_TARJETA } from '#lib/constants/limites.ts';
import type {
	SeccionClave,
	TarjetaCertificacionNestedItem,
	TarjetaCompleta,
	TarjetaContactoNestedItem,
	TarjetaDetalle,
	TarjetaEducacionNestedItem,
	TarjetaFaqNestedItem,
	TarjetaPublica,
	TarjetaSeccion,
	TarjetaSeoUpdateRequest,
	TarjetaSocialNestedItem,
	TarjetaThemeUpdateRequest,
	TarjetaUbicacionNestedItem,
	TarjetaUpdateRequest,
	UsuarioDetalle,
	VitrinaCategoriaNestedItem,
	VitrinaCompleta,
	VitrinaItemNestedItem,
	VitrinaUpdateRequest
} from '#lib/interfaces/index.ts';
import {
	AppError,
	tarjetaSeoService,
	tarjetaService,
	tarjetaThemeService,
	vitrinaService
} from '#lib/services/index.ts';
import { aPublica, ordenar } from '#lib/utils/tarjeta.ts';
import {
	categoriaNested,
	certificacionNested,
	conOrden,
	contactoNested,
	educacionNested,
	faqNested,
	itemNested,
	redNested,
	seccionNested,
	ubicacionNested
} from '#lib/utils/tarjetaNested.ts';

/** Paneles del editor: los de la tarjeta y uno por cada sección */
export type PanelEditor = 'perfil' | 'apariencia' | 'compartir' | 'seo' | SeccionClave;

export const PANELES_TARJETA = ['perfil', 'apariencia', 'compartir', 'seo'] as const;

/** Las listas de la tarjeta que se editan con `PATCH /tarjetas/{id}` */
export type ClaveLista =
	'contactos' | 'ubicaciones' | 'redes' | 'educaciones' | 'certificaciones' | 'faqs';

/** Lo que se envía de cada lista (un elemento sin id es nuevo) */
interface NestedDeLista {
	contactos: TarjetaContactoNestedItem;
	ubicaciones: TarjetaUbicacionNestedItem;
	redes: TarjetaSocialNestedItem;
	educaciones: TarjetaEducacionNestedItem;
	certificaciones: TarjetaCertificacionNestedItem;
	faqs: TarjetaFaqNestedItem;
}

interface NestedDeVitrina {
	categorias: VitrinaCategoriaNestedItem;
	items: VitrinaItemNestedItem;
}

const MAPEADORES: { [K in ClaveLista]: (item: NestedDeLista[K]) => NestedDeLista[K] } = {
	contactos: contactoNested,
	ubicaciones: ubicacionNested,
	redes: redNested,
	educaciones: educacionNested,
	certificaciones: certificacionNested,
	faqs: faqNested
};

/**
 * Lo que necesita `PanelLista` de una lista: cada operación arma la lista final, la envía y el
 * editor toma lo que devuelve el servidor. Lo que no tiene formulario (ocultar, mover, eliminar)
 * se ve al instante y se revierte si falla.
 */
export interface ServicioLista<T, D> {
	crear(datos: D): Promise<void>;
	actualizar(item: T, datos: D): Promise<void>;
	eliminar(item: T): Promise<void>;
	reordenar(ids: string[]): Promise<void>;
	cambiarVisible(item: T, visible: boolean): Promise<void>;
	/** Máximo de elementos que acepta la API */
	maximo: number;
}

/**
 * Un error de validación de la lista (`contactos.3.valor`) como error del formulario del elemento
 * (`valor`), para mostrarlo debajo de su campo.
 */
function errorDeElemento(error: unknown, prefijo: string): unknown {
	if (!(error instanceof AppError)) return error;
	const details: Record<string, unknown> = {};
	let delElemento = false;
	for (const [clave, valor] of Object.entries(error.details)) {
		if (clave.startsWith(`${prefijo}.`)) {
			details[clave.slice(prefijo.length + 1)] = valor;
			delElemento = true;
		} else {
			details[clave] = valor;
		}
	}
	return delElemento
		? new AppError({
				message: error.message,
				code: error.code,
				status: error.status,
				details,
				cause: error
			})
		: error;
}

/** Los ids en el orden nuevo → la lista reordenada */
function segunIds<T extends { id: string }>(lista: T[], ids: string[]): T[] {
	const porId = new Map(lista.map((elemento) => [elemento.id, elemento]));
	return ids.map((id) => porId.get(id)).filter((elemento): elemento is T => !!elemento);
}

/**
 * Estado del editor de una tarjeta. Lo comparten el user (su tarjeta) y los admins (cualquiera):
 * - `tarjeta`: lo guardado (la última respuesta del servidor).
 * - `cuenta`: el dueño (plan, email verificado, activo): decide si se puede publicar.
 * - `borrador`: los cambios sin guardar del panel abierto; el espejo los muestra al instante.
 *
 * Las escrituras van en cola, una a la vez: cada lista se envía completa y otra escritura en
 * paralelo podría mandar una versión vieja.
 */
export class EditorTarjeta {
	tarjeta = $state() as TarjetaCompleta;
	cuenta = $state() as UsuarioDetalle;
	borrador = $state<Partial<TarjetaCompleta> | null>(null);
	/** Hay cambios sin guardar en el panel abierto */
	sinGuardar = $state(false);

	/** Por qué no se puede publicar (null = se puede) */
	bloqueo = $derived(bloqueoPublicacion(this.cuenta));

	/** Lo que muestra el espejo: lo guardado más el borrador, como lo vería un visitante */
	vistaPrevia = $derived<TarjetaPublica>(
		aPublica(this.borrador ? { ...this.tarjeta, ...this.borrador } : this.tarjeta)
	);

	readonly modo: 'user' | 'admin';
	private readonly alCambiar: (tarjeta: TarjetaCompleta) => void;
	private cola: Promise<unknown> = Promise.resolve();

	constructor(
		inicial: TarjetaCompleta,
		cuenta: UsuarioDetalle,
		modo: 'user' | 'admin',
		alCambiar: (tarjeta: TarjetaCompleta) => void = () => {}
	) {
		this.tarjeta = inicial;
		this.cuenta = cuenta;
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

	/** Muestra cambios sin guardar en el espejo */
	previsualizar(cambios: Partial<TarjetaCompleta> | null, sinGuardar: boolean): void {
		this.borrador = cambios;
		this.sinGuardar = sinGuardar;
	}

	/** Corre la escritura cuando terminó la anterior (haya salido bien o no) */
	private encolar<T>(tarea: () => Promise<T>): Promise<T> {
		const resultado = this.cola.then(tarea, tarea);
		this.cola = resultado.catch(() => undefined);
		return resultado;
	}

	/**
	 * Respuesta de un PATCH, publicar o despublicar: datos y listas de la tarjeta (theme, SEO y
	 * vitrina no vienen y se conservan) y el estado actual de su dueño.
	 */
	private aplicarDetalle(detalle: TarjetaDetalle): void {
		const { user, ...tarjeta } = detalle;
		this.cuenta = { ...this.cuenta, ...user };
		this.actualizar(tarjeta);
	}

	/**
	 * `PATCH /tarjetas/{id}` con campos propios de la tarjeta (datos, imágenes, slug…). Lo guardado
	 * pasa a ser lo que se ve: se descarta el borrador del panel.
	 */
	async guardarDatos(datos: Omit<TarjetaUpdateRequest, ClaveLista | 'secciones'>): Promise<void> {
		const detalle = await this.encolar(() => tarjetaService.actualizar(this.tarjeta.id, datos));
		this.aplicarDetalle(detalle);
		this.previsualizar(null, false);
	}

	/**
	 * Envía una lista completa como estado final. Con `optimista`, la muestra antes de que responda
	 * el servidor y la revierte si falla.
	 */
	async guardarLista<K extends ClaveLista>(
		clave: K,
		lista: NestedDeLista[K][],
		optimista?: TarjetaCompleta[K]
	): Promise<void> {
		const anterior = this.tarjeta[clave];
		if (optimista) this.actualizar({ [clave]: optimista } as Partial<TarjetaCompleta>);
		const cuerpo = { [clave]: conOrden(lista).map(MAPEADORES[clave]) } as TarjetaUpdateRequest;
		try {
			const detalle = await this.encolar(() => tarjetaService.actualizar(this.tarjeta.id, cuerpo));
			this.aplicarDetalle(detalle);
		} catch (error) {
			if (optimista) this.actualizar({ [clave]: anterior } as Partial<TarjetaCompleta>);
			throw error;
		}
	}

	/**
	 * Las operaciones de una lista para `PanelLista`. `normalizar` ajusta la lista antes de
	 * enviarla (p. ej. un solo contacto principal por tipo).
	 */
	servicioLista<K extends ClaveLista, D extends Omit<NestedDeLista[K], 'id' | 'orden'>>(
		clave: K,
		normalizar: (lista: NestedDeLista[K][], cambiado: number) => NestedDeLista[K][] = (l) => l
	): ServicioLista<TarjetaCompleta[K][number], D> {
		type Item = TarjetaCompleta[K][number];
		const actuales = () => ordenar(this.tarjeta[clave] as Item[]);
		const enviar = async (lista: NestedDeLista[K][], indice: number) => {
			try {
				await this.guardarLista(clave, normalizar(lista, indice));
			} catch (error) {
				throw errorDeElemento(error, `${clave}.${indice}`);
			}
		};
		const optimista = (lista: Item[]) => {
			const ordenada = conOrden(lista);
			return this.guardarLista(
				clave,
				ordenada as unknown as NestedDeLista[K][],
				ordenada as TarjetaCompleta[K]
			);
		};

		return {
			maximo: LIMITES_TARJETA[clave],
			crear: (datos) => {
				const lista = [...actuales(), datos] as unknown as NestedDeLista[K][];
				return enviar(lista, lista.length - 1);
			},
			actualizar: (item, datos) => {
				const lista = actuales();
				const indice = lista.findIndex((actual) => actual.id === item.id);
				const nueva = lista.map((actual) =>
					actual.id === item.id ? { ...actual, ...datos } : actual
				) as unknown as NestedDeLista[K][];
				return enviar(nueva, indice);
			},
			eliminar: (item) => optimista(actuales().filter((actual) => actual.id !== item.id)),
			reordenar: (ids) => optimista(segunIds(actuales(), ids)),
			cambiarVisible: (item, visible) =>
				optimista(
					actuales().map((actual) =>
						actual.id === item.id ? { ...actual, is_visible: visible } : actual
					)
				)
		};
	}

	/** Orden, visibilidad y títulos de las 8 secciones (se ven al instante) */
	async guardarSecciones(secciones: TarjetaSeccion[]): Promise<void> {
		const anteriores = this.tarjeta.secciones;
		const nuevas = conOrden(secciones);
		this.actualizar({ secciones: nuevas });
		try {
			const detalle = await this.encolar(() =>
				tarjetaService.actualizar(this.tarjeta.id, { secciones: nuevas.map(seccionNested) })
			);
			this.aplicarDetalle(detalle);
		} catch (error) {
			this.actualizar({ secciones: anteriores });
			throw error;
		}
	}

	/** `PATCH /tarjeta-themes/{id}` con lo que cambió (nada que enviar = no se llama) */
	async guardarTheme(cambios: TarjetaThemeUpdateRequest): Promise<void> {
		if (Object.keys(cambios).length === 0) return;
		const theme = await this.encolar(() =>
			tarjetaThemeService.actualizar(this.tarjeta.theme.id, cambios)
		);
		this.guardado({ theme });
	}

	/** `PATCH /tarjeta-seos/{id}` */
	async guardarSeo(cambios: TarjetaSeoUpdateRequest): Promise<void> {
		const seo = await this.encolar(() =>
			tarjetaSeoService.actualizar(this.tarjeta.seo.id, cambios)
		);
		this.guardado({ seo });
	}

	/** `PATCH /vitrinas/{id}`: ajustes y/o listas finales de categorías e ítems */
	async guardarVitrina(cambios: VitrinaUpdateRequest, optimista?: VitrinaCompleta): Promise<void> {
		const anterior = this.tarjeta.vitrina;
		if (optimista) this.actualizar({ vitrina: optimista });
		try {
			const vitrina = await this.encolar(() =>
				vitrinaService.actualizar(this.tarjeta.vitrina.id, cambios)
			);
			this.actualizar({ vitrina });
		} catch (error) {
			if (optimista) this.actualizar({ vitrina: anterior });
			throw error;
		}
	}

	/**
	 * Las operaciones de categorías o ítems de la vitrina para `PanelLista`. Eliminar una
	 * categoría deja sus ítems sin categoría en el mismo PATCH (la API no borra una categoría usada).
	 */
	servicioVitrina<
		K extends 'categorias' | 'items',
		D extends Omit<NestedDeVitrina[K], 'id' | 'orden'>
	>(clave: K): ServicioLista<VitrinaCompleta[K][number], D> {
		type Item = VitrinaCompleta[K][number];
		const mapear = (clave === 'categorias' ? categoriaNested : itemNested) as unknown as (
			item: NestedDeVitrina[K]
		) => NestedDeVitrina[K];
		const actuales = () => ordenar(this.tarjeta.vitrina[clave] as Item[]);
		const cuerpo = (lista: NestedDeVitrina[K][]) =>
			({ [clave]: conOrden(lista).map(mapear) }) as VitrinaUpdateRequest;
		const enviar = async (lista: NestedDeVitrina[K][], indice: number) => {
			try {
				await this.guardarVitrina(cuerpo(lista));
			} catch (error) {
				throw errorDeElemento(error, `${clave}.${indice}`);
			}
		};
		const optimista = (lista: Item[]) => {
			const ordenada = conOrden(lista);
			return this.guardarVitrina(cuerpo(ordenada as unknown as NestedDeVitrina[K][]), {
				...this.tarjeta.vitrina,
				[clave]: ordenada
			});
		};

		return {
			maximo: LIMITES_TARJETA[clave],
			crear: (datos) => {
				const lista = [...actuales(), datos] as unknown as NestedDeVitrina[K][];
				return enviar(lista, lista.length - 1);
			},
			actualizar: (item, datos) => {
				const lista = actuales();
				const indice = lista.findIndex((actual) => actual.id === item.id);
				const nueva = lista.map((actual) =>
					actual.id === item.id ? { ...actual, ...datos } : actual
				) as unknown as NestedDeVitrina[K][];
				return enviar(nueva, indice);
			},
			eliminar: async (item) => {
				if (clave === 'items') return optimista(actuales().filter((a) => a.id !== item.id));
				// Categoría: sus ítems quedan sin categoría, en la misma petición
				const { vitrina } = this.tarjeta;
				const categorias = conOrden(ordenar(vitrina.categorias).filter((c) => c.id !== item.id));
				const items = ordenar(vitrina.items).map((i) =>
					i.categoria_id === item.id ? { ...i, categoria_id: null, categoria: null } : i
				);
				await this.guardarVitrina(
					{ categorias: categorias.map(categoriaNested), items: conOrden(items).map(itemNested) },
					{ ...vitrina, categorias, items }
				);
			},
			reordenar: (ids) => optimista(segunIds(actuales(), ids)),
			cambiarVisible: (item, visible) =>
				optimista(
					actuales().map((actual) =>
						actual.id === item.id ? { ...actual, is_visible: visible } : actual
					)
				)
		};
	}

	/** `POST /tarjetas/{id}/publicar` */
	async publicar(): Promise<void> {
		const detalle = await this.encolar(() => tarjetaService.publicar(this.tarjeta.id));
		this.aplicarDetalle(detalle);
	}

	/** `POST /tarjetas/{id}/despublicar` */
	async despublicar(): Promise<void> {
		const detalle = await this.encolar(() => tarjetaService.despublicar(this.tarjeta.id));
		this.aplicarDetalle(detalle);
	}
}

const CLAVE = Symbol('editor-tarjeta');

export function setEditor(editor: EditorTarjeta): EditorTarjeta {
	return setContext(CLAVE, editor);
}

export function getEditor(): EditorTarjeta {
	return getContext<EditorTarjeta>(CLAVE);
}
