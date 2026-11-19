<!--
	Panel de una lista de la tarjeta: muestra los elementos (ordenables, con visibilidad), abre el
	formulario en una hoja para crear o editar y confirma antes de eliminar. Cada sección le pasa su
	servicio, cómo se ve cada fila y su formulario.
-->
<script lang="ts" generics="T extends { id: string; is_visible?: boolean }, D">
	import type { Component, Snippet } from 'svelte';
	import { Button, EmptyState, ModalConfirm, Sheet } from '#lib/components/ui/index.ts';
	import { PlusIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import ListaOrdenable from './listaOrdenable.svelte';

	interface Servicio {
		crear(padreId: string, datos: D): Promise<T>;
		actualizar(id: string, datos: Partial<D>): Promise<T>;
		eliminar(id: string): Promise<void>;
		reordenar(padreId: string, ids: string[]): Promise<T[]>;
	}

	interface Props {
		items: T[];
		/** Tarjeta, vitrina o ubicación a la que pertenecen */
		padreId: string;
		servicio: Servicio;
		/** Guarda la lista nueva en el editor (y así en el espejo) */
		aplicar: (items: T[]) => void;
		nombre: (item: T) => string;
		/** "contacto", "pregunta" */
		singular: string;
		agregarLabel: string;
		fila: Snippet<[T]>;
		formulario: Snippet<[{ inicial: T | null; id: string; guardar: (datos: D) => Promise<void> }]>;
		vacio: { titulo: string; descripcion: string; icono: Component<{ class?: string }> };
		/** Sin interruptor de visibilidad (p. ej. horarios) */
		sinVisibilidad?: boolean;
		/** Para concordar los avisos: «Ubicación agregada» */
		femenino?: boolean;
	}

	let {
		items,
		padreId,
		servicio,
		aplicar,
		nombre,
		singular,
		agregarLabel,
		fila,
		formulario,
		vacio,
		sinVisibilidad = false,
		femenino = false
	}: Props = $props();

	const sufijo = $derived(femenino ? 'a' : 'o');

	const formId = $props.id();
	let editando = $state<T | 'nuevo' | null>(null);
	let porEliminar = $state<T | null>(null);
	let eliminando = $state(false);
	let enviando = $state(false);

	async function guardar(datos: D) {
		enviando = true;
		try {
			if (editando === 'nuevo') {
				const nuevo = await servicio.crear(padreId, datos);
				aplicar([...items, nuevo]);
				alert('success', `${mayuscula(singular)} agregad${sufijo}`);
			} else if (editando) {
				const actualizado = await servicio.actualizar(editando.id, datos);
				aplicar(items.map((item) => (item.id === actualizado.id ? actualizado : item)));
				alert('success', 'Cambios guardados');
			}
			editando = null;
		} finally {
			enviando = false;
		}
	}

	async function mover(ids: string[]) {
		try {
			aplicar(await servicio.reordenar(padreId, ids));
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}

	async function cambiarVisible(item: T, visible: boolean) {
		const anteriores = items;
		aplicar(
			items.map((actual) => (actual.id === item.id ? { ...actual, is_visible: visible } : actual))
		);
		try {
			const actualizado = await servicio.actualizar(item.id, {
				is_visible: visible
			} as unknown as Partial<D>);
			aplicar(anteriores.map((actual) => (actual.id === actualizado.id ? actualizado : actual)));
		} catch (causa) {
			aplicar(anteriores);
			alert('error', errorService.getMessage(causa));
		}
	}

	async function eliminar() {
		if (!porEliminar) return;
		eliminando = true;
		try {
			await servicio.eliminar(porEliminar.id);
			const id = porEliminar.id;
			aplicar(items.filter((item) => item.id !== id));
			alert('success', `${mayuscula(singular)} eliminad${sufijo}`);
			porEliminar = null;
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			eliminando = false;
		}
	}

	function mayuscula(texto: string): string {
		return texto.charAt(0).toUpperCase() + texto.slice(1);
	}
</script>

{#if items.length === 0}
	<div class="rounded-2xl border border-dashed border-light-four dark:border-dark-four">
		<EmptyState icono={vacio.icono} titulo={vacio.titulo} descripcion={vacio.descripcion}>
			{#snippet acciones()}
				<Button onclick={() => (editando = 'nuevo')}>
					{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
					{agregarLabel}
				</Button>
			{/snippet}
		</EmptyState>
	</div>
{:else}
	<ListaOrdenable
		{items}
		{nombre}
		{fila}
		etiqueta={agregarLabel}
		onMover={mover}
		onEditar={(item) => (editando = item)}
		onEliminar={(item) => (porEliminar = item)}
		onVisible={sinVisibilidad ? undefined : cambiarVisible}
	/>
	<Button variant="secondary" class="mt-4" onclick={() => (editando = 'nuevo')}>
		{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
		{agregarLabel}
	</Button>
{/if}

<Sheet
	open={editando !== null}
	title={editando === 'nuevo' ? agregarLabel : `Editar ${singular}`}
	onClose={() => (editando = null)}
	dismissible={!enviando}
	size="lg"
>
	{#if editando !== null}
		{@render formulario({ inicial: editando === 'nuevo' ? null : editando, id: formId, guardar })}
	{/if}
	{#snippet footer()}
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={() => (editando = null)} disabled={enviando}>
				Cancelar
			</Button>
			<Button type="submit" form={formId} loading={enviando}>
				{editando === 'nuevo' ? 'Agregar' : 'Guardar cambios'}
			</Button>
		</div>
	{/snippet}
</Sheet>

<ModalConfirm
	isOpen={porEliminar !== null}
	title="¿Eliminar {porEliminar ? nombre(porEliminar) : ''}?"
	message="Dejará de verse en la tarjeta. Esta acción no se puede deshacer desde el panel."
	confirmLabel="Eliminar"
	loading={eliminando}
	onConfirm={eliminar}
	onCancel={() => (porEliminar = null)}
/>
