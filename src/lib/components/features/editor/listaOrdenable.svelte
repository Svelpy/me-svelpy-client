<!--
	Lista de elementos de la tarjeta (contactos, redes, ítems…): cada fila con su contenido, un
	interruptor de visibilidad, editar, eliminar y mover. Mover se hace con botones (accesible con
	teclado y lector de pantalla), y el cambio se anuncia.
-->
<script lang="ts" generics="T extends { id: string; is_visible?: boolean }">
	import type { Snippet } from 'svelte';
	import { Switch } from '#lib/components/ui/index.ts';
	import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from '#lib/icons/outline/index.ts';

	interface Props {
		items: T[];
		/** Nombre de cada elemento para los botones ("Subir Consultorio Norte") */
		nombre: (item: T) => string;
		fila: Snippet<[T]>;
		onMover: (ids: string[]) => Promise<void>;
		onEditar: (item: T) => void;
		onEliminar: (item: T) => void;
		/** Si se omite, no hay interruptor de visibilidad */
		onVisible?: (item: T, visible: boolean) => Promise<void>;
		/** Qué hay en la lista, para su nombre accesible */
		etiqueta: string;
	}

	let { items, nombre, fila, onMover, onEditar, onEliminar, onVisible, etiqueta }: Props = $props();

	let anuncio = $state('');
	let moviendo = $state(false);

	async function mover(indice: number, paso: -1 | 1) {
		const destino = indice + paso;
		if (destino < 0 || destino >= items.length || moviendo) return;
		const ids = items.map((item) => item.id);
		[ids[indice], ids[destino]] = [ids[destino], ids[indice]];
		// Antes de esperar: al volver, `items` ya puede venir en el orden nuevo
		const movido = nombre(items[indice]);
		const total = items.length;
		moviendo = true;
		try {
			await onMover(ids);
			anuncio = `${movido} quedó en el lugar ${destino + 1} de ${total}.`;
		} finally {
			moviendo = false;
		}
	}

	const boton =
		'grid size-9 place-items-center rounded-lg text-light-two_d transition-colors hover:bg-light-one_d hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three disabled:pointer-events-none disabled:opacity-30 dark:text-dark-two_d dark:hover:bg-dark-one_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three';
</script>

<ul
	aria-label={etiqueta}
	class="divide-y divide-light-four/40 overflow-hidden rounded-2xl border border-light-four/40 dark:divide-dark-one_d dark:border-dark-one_d"
>
	{#each items as item, indice (item.id)}
		<li
			class={[
				'flex items-center gap-2 py-2.5 pr-2 pl-4',
				item.is_visible === false && 'bg-light-one_d/50 dark:bg-dark-one_d/40'
			]}
		>
			<div class={['min-w-0 flex-1', item.is_visible === false && 'opacity-60']}>
				{@render fila(item)}
			</div>
			{#if onVisible}
				<Switch
					label="{item.is_visible === false ? 'Mostrar' : 'Ocultar'} {nombre(item)} en la tarjeta"
					etiquetaOculta
					checked={item.is_visible !== false}
					onchange={(visible) => onVisible(item, visible)}
					class="mr-1"
				/>
			{/if}
			<div class="flex shrink-0 items-center">
				<button
					type="button"
					class={boton}
					aria-label="Subir {nombre(item)}"
					disabled={indice === 0 || moviendo}
					onclick={() => mover(indice, -1)}
				>
					<ArrowUpIcon class="size-4" />
				</button>
				<button
					type="button"
					class={boton}
					aria-label="Bajar {nombre(item)}"
					disabled={indice === items.length - 1 || moviendo}
					onclick={() => mover(indice, 1)}
				>
					<ArrowDownIcon class="size-4" />
				</button>
				<button
					type="button"
					class={boton}
					aria-label="Editar {nombre(item)}"
					onclick={() => onEditar(item)}
				>
					<PencilIcon class="size-4" />
				</button>
				<button
					type="button"
					class="{boton} hover:text-light-error dark:hover:text-dark-error"
					aria-label="Eliminar {nombre(item)}"
					onclick={() => onEliminar(item)}
				>
					<TrashIcon class="size-4" />
				</button>
			</div>
		</li>
	{/each}
</ul>
<p class="sr-only" aria-live="polite">{anuncio}</p>
