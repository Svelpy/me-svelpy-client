<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** Ancla de la sección (`#vitrina`) */
		id: string;
		titulo: string;
		/** El título solo para lectores de pantalla (accesos rápidos) */
		tituloOculto?: boolean;
		children: Snippet;
		class?: string;
	}

	let { id, titulo, tituloOculto = false, children, class: className }: Props = $props();
</script>

<section {id} aria-labelledby="{id}-titulo" class={cn('scroll-mt-6', className)}>
	<h2
		id="{id}-titulo"
		class={tituloOculto
			? 'sr-only'
			: 'mb-4 font-t-titulos text-[1.375rem] leading-tight text-balance text-t-titulo'}
		style="font-weight: var(--t-peso-titulos)"
	>
		{titulo}
	</h2>
	{@render children()}
</section>
