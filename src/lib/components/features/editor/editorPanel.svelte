<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeftIcon } from '#lib/icons/outline/index.ts';

	interface Props {
		titulo: string;
		descripcion?: string;
		children: Snippet;
		/** Acciones fijas al pie (Guardar cambios) */
		pie?: Snippet;
		/** En el celular, vuelve al índice de la tarjeta */
		alVolver?: () => void;
	}

	let { titulo, descripcion, children, pie, alVolver }: Props = $props();

	const id = $props.id();
</script>

<section aria-labelledby="{id}-titulo" class="min-w-0">
	{#if alVolver}
		<button
			type="button"
			onclick={alVolver}
			class="mb-5 inline-flex items-center gap-1.5 rounded-lg py-1 text-sm font-medium text-light-two_d hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three @3xl:hidden dark:text-dark-two_d dark:hover:text-dark-two"
		>
			<ArrowLeftIcon class="size-4" />
			Todas las partes de la tarjeta
		</button>
	{/if}
	<h2
		id="{id}-titulo"
		class="font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.01em]"
	>
		{titulo}
	</h2>
	{#if descripcion}
		<p class="mt-1.5 max-w-[60ch] text-[0.9375rem] text-light-two_d dark:text-dark-two_d">
			{descripcion}
		</p>
	{/if}
	<div class="mt-7">{@render children()}</div>
	{#if pie}
		<!-- En el celular el botón de guardar queda al alcance del pulgar -->
		<div
			class="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-wrap items-center justify-end gap-2 border-t border-light-four/40 bg-light-one/95 px-4 py-3 backdrop-blur @3xl:static @3xl:mx-0 @3xl:border-0 @3xl:bg-transparent @3xl:px-0 @3xl:py-0 @3xl:backdrop-blur-none dark:border-dark-one_d dark:bg-dark-one/95 @3xl:dark:bg-transparent"
		>
			{@render pie()}
		</div>
	{/if}
</section>
