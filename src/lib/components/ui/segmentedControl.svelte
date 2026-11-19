<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Opcion {
		value: T;
		label: string;
		icon?: Component<{ class?: string }>;
	}

	interface Props {
		/** Nombre del grupo (leyenda del fieldset) */
		label: string;
		/** La leyenda solo para lectores de pantalla */
		labelOculta?: boolean;
		options: Opcion[];
		value: T;
		onchange?: (value: T) => void;
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		label,
		labelOculta = false,
		options,
		value = $bindable(),
		onchange,
		size = 'md',
		class: className
	}: Props = $props();

	const name = $props.id();
</script>

<!-- Radios nativos: flechas del teclado y lectores de pantalla funcionan sin código extra -->
<fieldset class={cn('min-w-0', className)}>
	<legend
		class={labelOculta ? 'sr-only' : 'mb-1.5 text-sm font-medium text-light-two dark:text-dark-two'}
	>
		{label}
	</legend>
	<div
		class="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-light-one_d p-1 dark:bg-dark-one_d"
	>
		{#each options as opcion (opcion.value)}
			<label class="relative">
				<input
					type="radio"
					{name}
					value={opcion.value}
					checked={opcion.value === value}
					onchange={() => {
						value = opcion.value;
						onchange?.(opcion.value);
					}}
					class="peer sr-only"
				/>
				<span
					class={[
						'flex cursor-pointer items-center gap-1.5 rounded-lg font-medium whitespace-nowrap text-light-two_d transition-colors peer-checked:bg-light-one peer-checked:text-light-two peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-light-three hover:text-light-two dark:text-dark-two_d dark:peer-checked:bg-dark-one dark:peer-checked:text-dark-two dark:peer-focus-visible:outline-dark-three dark:hover:text-dark-two',
						size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm'
					]}
				>
					{#if opcion.icon}<opcion.icon class="size-4" />{/if}
					{opcion.label}
				</span>
			</label>
		{/each}
	</div>
</fieldset>
