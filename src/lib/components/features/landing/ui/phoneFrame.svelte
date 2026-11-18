<!--
	Marco de teléfono con barra de direcciones: muestra la URL pública del perfil (me.svelpy.com/slug).
	Con `scrollable` la pantalla se puede recorrer con rueda, toque o teclado.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';
	import { ME_DOMINIO } from '../landing.content.ts';

	interface Props {
		/** Ruta del perfil después del dominio, p. ej. "valeria-rojas". */
		slug: string;
		scrollable?: boolean;
		/** Nombre accesible de la pantalla cuando es desplazable. */
		screenLabel?: string;
		class?: string;
		children: Snippet;
	}

	let { slug, scrollable = false, screenLabel, class: className = '', children }: Props = $props();
</script>

<div
	class={cn(
		'relative w-full max-w-[300px] rounded-[2.75rem] bg-primary-800 p-2 ring-1 ring-primary-700',
		className
	)}
>
	<div class="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[2.25rem] bg-white">
		<!-- Barra de estado + isla -->
		<div
			class="relative flex h-8 shrink-0 items-center justify-between px-6 text-[11px] font-semibold text-primary-900"
			aria-hidden="true"
		>
			<span>9:41</span>
			<span
				class="absolute top-2 left-1/2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-primary-950"
			></span>
			<span class="flex items-center gap-1">
				<span class="h-2 w-3 rounded-[2px] bg-primary-900"></span>
				<span class="h-2.5 w-5 rounded-[3px] border border-primary-900 p-px">
					<span class="block h-full w-3/4 rounded-[1px] bg-primary-900"></span>
				</span>
			</span>
		</div>

		<!-- Barra de direcciones -->
		<div
			class="mx-3 mb-2 flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary-100 px-3 font-mono text-[11px] text-primary-600"
		>
			<svg viewBox="0 0 24 24" class="size-3 shrink-0" fill="currentColor" aria-hidden="true">
				<path
					d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z"
				/>
			</svg>
			<span class="truncate" data-testid="phone-url">
				{ME_DOMINIO}/<span class="text-primary-900">{slug}</span>
			</span>
		</div>

		<!-- Pantalla -->
		{#if scrollable}
			<!-- Una región desplazable debe poder recibir foco para recorrerla con el teclado (WCAG 2.1.1). -->
			<!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary"
				role="region"
				aria-label={screenLabel}
				tabindex="0"
			>
				{@render children()}
			</div>
		{:else}
			<div class="relative min-h-0 flex-1 overflow-hidden">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
