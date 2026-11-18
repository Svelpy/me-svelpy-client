<!--
	Pestañas accesibles con forma de cápsula (patrón WAI-ARIA Tabs, activación automática).
	Flechas izquierda/derecha, Inicio y Fin mueven el foco y seleccionan la pestaña.
-->
<script lang="ts" generics="T extends { id: string; label: string }">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		items: T[];
		/** id de la pestaña seleccionada. */
		value?: string;
		/** Nombre accesible de la lista de pestañas. */
		label: string;
		/** Prefijo único para los ids de pestañas y panel. */
		idPrefix: string;
		tone?: 'light' | 'dark';
		class?: string;
		listClass?: string;
		panelClass?: string;
		/** Se llama solo cuando la persona elige una pestaña (clic o teclado). */
		onselect?: (id: string) => void;
		panel: Snippet<[T]>;
		/** Contenido junto a la lista de pestañas (p. ej. un botón de pausa). */
		trailing?: Snippet;
	}

	let {
		items,
		value = $bindable(items[0]?.id),
		label,
		idPrefix,
		tone = 'light',
		class: className = '',
		listClass = '',
		panelClass = '',
		onselect,
		panel,
		trailing
	}: Props = $props();

	const tabs: HTMLButtonElement[] = $state([]);
	const active = $derived(items.find((item) => item.id === value) ?? items[0]);

	const tabId = (id: string) => `${idPrefix}-tab-${id}`;
	const panelId = $derived(`${idPrefix}-panel`);

	function select(index: number, focus = false) {
		const item = items[index];
		if (!item) return;
		value = item.id;
		onselect?.(item.id);
		if (focus) tabs[index]?.focus();
	}

	function onkeydown(event: KeyboardEvent, index: number) {
		const last = items.length - 1;
		const next: Record<string, number> = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last
		};
		if (!(event.key in next)) return;
		event.preventDefault();
		select(next[event.key], true);
	}
</script>

<div class={className}>
	<div class="flex max-w-full items-center gap-2">
		<div
			role="tablist"
			aria-label={label}
			class={cn(
				'inline-flex max-w-full min-w-0 [scrollbar-width:none] gap-1 overflow-x-auto rounded-full p-1',
				tone === 'dark' ? 'bg-white/10' : 'bg-primary-100',
				listClass
			)}
		>
			{#each items as item, index (item.id)}
				{@const selected = item.id === active?.id}
				<button
					bind:this={tabs[index]}
					type="button"
					role="tab"
					id={tabId(item.id)}
					aria-selected={selected}
					aria-controls={panelId}
					tabindex={selected ? 0 : -1}
					onclick={() => select(index)}
					onkeydown={(event) => onkeydown(event, index)}
					class={cn(
						'h-10 shrink-0 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4',
						tone === 'dark' ? 'focus-visible:outline-white' : 'focus-visible:outline-primary-900',
						selected
							? tone === 'dark'
								? 'bg-secondary text-primary-950'
								: 'bg-primary-900 text-white'
							: tone === 'dark'
								? 'text-primary-300 hover:text-white'
								: 'text-primary-700 hover:text-primary-900'
					)}
				>
					{item.label}
				</button>
			{/each}
		</div>
		{@render trailing?.()}
	</div>

	{#if active}
		<div
			id={panelId}
			role="tabpanel"
			aria-labelledby={tabId(active.id)}
			class={cn('focus-visible:outline-none', panelClass)}
		>
			{@render panel(active)}
		</div>
	{/if}
</div>
