<script lang="ts">
	import type { Snippet } from 'svelte';
	import { XIcon } from '#lib/icons/outline/index.ts';

	interface Props {
		open: boolean;
		titulo: string;
		onClose: () => void;
		children: Snippet;
	}

	let { open, titulo, onClose, children }: Props = $props();

	const id = $props.id();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<!-- Diálogo con los colores de la tarjeta: hoja inferior en el celular, centrado en escritorio -->
<dialog
	bind:this={dialog}
	aria-labelledby="{id}-titulo"
	oncancel={(event) => {
		event.preventDefault();
		onClose();
	}}
	onclick={(event) => {
		if (event.target === dialog) onClose();
	}}
	class="m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] border-0 bg-t-fondo p-0 font-t-texto text-t-texto shadow-2xl backdrop:bg-black/55 md:m-auto md:max-w-lg md:rounded-[1.75rem]"
>
	<!-- Cerrada no deja en la página un título vacío ni contenido sin elegir -->
	{#if open}
		<div class="flex max-h-[inherit] flex-col">
			<header class="flex shrink-0 items-center justify-between gap-3 px-5 pt-5 pb-2">
				<h2
					id="{id}-titulo"
					class="font-t-titulos text-lg leading-tight text-t-titulo"
					style="font-weight: var(--t-peso-titulos)"
				>
					{titulo}
				</h2>
				<button
					type="button"
					onclick={onClose}
					aria-label="Cerrar"
					class="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-t-texto-sec transition-colors hover:bg-t-superficie focus-visible:outline-2 focus-visible:outline-t-primario"
				>
					<XIcon class="size-5" />
				</button>
			</header>
			<div
				class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
			>
				{@render children()}
			</div>
		</div>
	{/if}
</dialog>
