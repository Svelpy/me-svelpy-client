<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { ArrowLeftIcon } from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		title: string;
		description?: string;
		/** Enlace para volver (p. ej. al listado) */
		volver?: { href: ResolvedPathname; label: string };
		/** Botones de acción a la derecha */
		actions?: Snippet;
		class?: string;
	}

	let { title, description, volver, actions, class: className }: Props = $props();
</script>

<header class={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
	<div class="min-w-0">
		{#if volver}
			<a
				href={volver.href}
				class="mb-2 -ml-1 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-sm font-medium text-light-two_d transition-colors hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
			>
				<ArrowLeftIcon class="size-4" />
				{volver.label}
			</a>
		{/if}
		<h1
			class="font-display text-[1.625rem] leading-tight font-semibold tracking-[-0.01em] text-light-two sm:text-[1.875rem] dark:text-dark-two"
		>
			{title}
		</h1>
		{#if description}
			<p class="mt-1.5 max-w-2xl text-[0.9375rem] text-light-two_d dark:text-dark-two_d">
				{description}
			</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 flex-wrap gap-2">{@render actions()}</div>
	{/if}
</header>
