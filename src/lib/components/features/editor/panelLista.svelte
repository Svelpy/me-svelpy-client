<!--
	Panel de una lista de la tarjeta: muestra los elementos (ordenables, con visibilidad), abre el
	formulario en una hoja para crear o editar y confirma antes de eliminar. Cada sección le pasa su
	servicio (`editor.servicioLista` / `servicioVitrina`), cómo se ve cada fila y su formulario.
-->
<script lang="ts" generics="T extends { id: string; is_visible?: boolean }, D">
	import type { Component, Snippet } from 'svelte';
	import { Button, EmptyState, ModalConfirm, Sheet } from '#lib/components/ui/index.ts';
	import { PlusIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import type { ServicioLista } from './estadoEditor.svelte.ts';
	import ListaOrdenable from './listaOrdenable.svelte';

	interface Props {
		items: T[];
		servicio: ServicioLista<T, D>;
		nombre: (item: T) => string;
		/** "contacto", "pregunta" */
		singular: string;
		/** "contactos", "preguntas": para el aviso del máximo */
		plural: string;
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
		servicio,
		nombre,
		singular,
		plural,
		agregarLabel,
		fila,
		formulario,
		vacio,
		sinVisibilidad = false,
		femenino = false
	}: Props = $props();

	const sufijo = $derived(femenino ? 'a' : 'o');
	const lleno = $derived(items.length >= servicio.maximo);

	const formId = $props.id();
	let editando = $state<T | 'nuevo' | null>(null);
	let porEliminar = $state<T | null>(null);
	let eliminando = $state(false);
	let enviando = $state(false);

	async function guardar(datos: D) {
		enviando = true;
		try {
			if (editando === 'nuevo') {
				await servicio.crear(datos);
				alert('success', `${mayuscula(singular)} agregad${sufijo}`);
			} else if (editando) {
				await servicio.actualizar(editando, datos);
				alert('success', 'Cambios guardados');
			}
			editando = null;
		} finally {
			enviando = false;
		}
	}

	// Mover y ocultar se ven al instante; si el servidor falla, el editor lo revierte
	async function mover(ids: string[]) {
		try {
			await servicio.reordenar(ids);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}

	async function cambiarVisible(item: T, visible: boolean) {
		try {
			await servicio.cambiarVisible(item, visible);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}

	async function eliminar() {
		if (!porEliminar) return;
		eliminando = true;
		const item = porEliminar;
		porEliminar = null;
		try {
			await servicio.eliminar(item);
			alert('success', `${mayuscula(singular)} eliminad${sufijo}`);
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
	<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
		<Button variant="secondary" onclick={() => (editando = 'nuevo')} disabled={lleno}>
			{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
			{agregarLabel}
		</Button>
		{#if lleno}
			<p class="text-sm text-light-two_d dark:text-dark-two_d">
				Llegaste al máximo de {servicio.maximo}
				{plural}. Quita uno para agregar otro.
			</p>
		{/if}
	</div>
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
