<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		icono?: Component<{ class?: string }>;
		titulo: string;
		/** Qué hacer para llenarlo, no un lamento */
		descripcion?: string;
		acciones?: Snippet;
		class?: string;
	}

	let { icono: Icono, titulo, descripcion, acciones, class: className }: Props = $props();
</script>

<div class={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
	{#if Icono}
		<span
			class="grid size-12 place-items-center rounded-2xl bg-light-one_d text-light-two_d dark:bg-dark-one_d dark:text-dark-two_d"
		>
			<Icono class="size-6" />
		</span>
	{/if}
	<p class="mt-4 font-display text-lg font-semibold text-light-two dark:text-dark-two">{titulo}</p>
	{#if descripcion}
		<p class="mt-1 max-w-sm text-sm text-light-two_d dark:text-dark-two_d">{descripcion}</p>
	{/if}
	{#if acciones}
		<div class="mt-5 flex flex-wrap justify-center gap-2">{@render acciones()}</div>
	{/if}
</div>
