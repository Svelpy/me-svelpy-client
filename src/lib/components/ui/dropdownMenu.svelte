<script lang="ts">
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';
	import type { DropdownOption } from '#lib/interfaces/index.ts';
	import { clickOutside, portal } from '#lib/utils/index.ts';

	interface Props {
		options: DropdownOption[];
		width: number;
		class?: string;
		isOpen: boolean;
		triggerElement?: HTMLElement;
		/** Nombre accesible del menú */
		label?: string;
	}

	let {
		options,
		width,
		class: className = '',
		isOpen = $bindable(),
		triggerElement,
		label = 'Opciones'
	}: Props = $props();

	let menu = $state<HTMLElement>();
	let items = $state<HTMLButtonElement[]>([]);

	function close(devolverFoco = true): void {
		isOpen = false;
		if (devolverFoco) triggerElement?.focus();
	}

	function handleSelect(option: DropdownOption) {
		if (option.disabled) return;
		close(false);
		option.action?.();
	}

	// Se posiciona bajo el botón que lo abre (fixed: se mide desde el viewport) y enfoca el primer item
	$effect(() => {
		if (!isOpen || !triggerElement || !menu) return;
		const rect = triggerElement.getBoundingClientRect();
		menu.style.position = 'fixed';
		menu.style.top = `${rect.bottom + 6}px`;
		menu.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
		menu.style.zIndex = '60';
		tick().then(() => items.find((item) => item && !item.disabled)?.focus());
	});

	// Patrón menu: flechas recorren los items, Escape y Tab cierran
	function handleKeydown(event: KeyboardEvent) {
		const habilitados = items.filter((item) => item && !item.disabled);
		const actual = habilitados.indexOf(document.activeElement as HTMLButtonElement);
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const paso = event.key === 'ArrowDown' ? 1 : -1;
			habilitados[(actual + paso + habilitados.length) % habilitados.length]?.focus();
		} else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			habilitados[event.key === 'Home' ? 0 : habilitados.length - 1]?.focus();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'Tab') {
			close(false);
		}
	}
</script>

{#if isOpen}
	<div
		use:portal
		use:clickOutside={{ callback: () => close(false), exclude: triggerElement }}
		bind:this={menu}
		class="overflow-hidden rounded-2xl border border-light-four/40 bg-light-one p-1 shadow-xl dark:border-dark-one_d dark:bg-dark-one {className}"
		style="width: {width}px;"
		role="menu"
		aria-label={label}
		tabindex="-1"
		onkeydown={handleKeydown}
		transition:scale={{ duration: 120, start: 0.96, opacity: 0 }}
	>
		{#each options as option, i (option.id || i)}
			{#if option.divider && i > 0}
				<div
					class="my-1 border-t border-light-four/40 dark:border-dark-one_d"
					role="separator"
				></div>
			{/if}
			<button
				bind:this={items[i]}
				type="button"
				role="menuitem"
				tabindex="-1"
				disabled={option.disabled}
				onclick={() => handleSelect(option)}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-light-two transition-colors outline-none hover:bg-light-one_d focus-visible:bg-light-one_d disabled:cursor-not-allowed disabled:opacity-50 dark:text-dark-two dark:hover:bg-dark-one_d dark:focus-visible:bg-dark-one_d"
			>
				{#if option.icon}
					<option.icon class="size-4.5 shrink-0 text-light-two_d dark:text-dark-two_d" />
				{/if}
				{option.label}
			</button>
		{/each}
	</div>
{/if}
