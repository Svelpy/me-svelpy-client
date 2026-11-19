<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	type Variante = 'primario' | 'secundario' | 'contorno' | 'suave';

	interface Props {
		children: Snippet;
		href?: string;
		/** Abre en otra pestaña (WhatsApp, mapas, redes) */
		externo?: boolean;
		variante?: Variante;
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		icono?: Component<{ class?: string }>;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		'aria-label'?: string;
		class?: string;
	}

	let {
		children,
		href,
		externo = false,
		variante = 'primario',
		size = 'md',
		fullWidth = false,
		icono: Icono,
		disabled = false,
		onclick,
		'aria-label': ariaLabel,
		class: className
	}: Props = $props();

	const variantes: Record<Variante, string> = {
		primario: 'bg-t-primario text-t-sobre-primario',
		secundario: 'bg-t-secundario text-t-sobre-secundario',
		contorno: 'border-2 border-t-primario text-t-primario',
		suave: 'bg-t-fondo-icono text-t-icono'
	};

	const tamanos = {
		sm: 'h-9 gap-1.5 px-3.5 text-sm',
		md: 'h-12 gap-2 px-5 text-[0.9375rem]',
		lg: 'h-14 gap-2.5 px-6 text-[1.0625rem]'
	};

	const clases = $derived(
		cn(
			'inline-flex items-center justify-center rounded-full font-semibold transition-[filter,transform] duration-150 hover:brightness-[1.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-t-primario active:scale-[0.98] disabled:opacity-60 motion-reduce:transform-none',
			variantes[variante],
			tamanos[size],
			fullWidth && 'w-full',
			className
		)
	);
</script>

{#if href}
	<a
		{href}
		target={externo ? '_blank' : undefined}
		rel="external noopener noreferrer"
		aria-label={ariaLabel}
		class={clases}
	>
		{#if Icono}<Icono class="size-5 shrink-0" />{/if}
		{@render children()}
	</a>
{:else}
	<button type="button" {onclick} {disabled} aria-label={ariaLabel} class={clases}>
		{#if Icono}<Icono class="size-5 shrink-0" />{/if}
		{@render children()}
	</button>
{/if}
