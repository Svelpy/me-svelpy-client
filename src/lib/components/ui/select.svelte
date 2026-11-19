<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils/cn.ts';

	interface Props extends Omit<HTMLSelectAttributes, 'children' | 'size'> {
		/** Las <option> */
		children: Snippet;
		label?: string;
		hint?: string;
		error?: string;
		size?: 'sm' | 'md';
		value?: string | number | null;
		class?: string;
	}

	let {
		children,
		label,
		hint,
		error,
		size = 'md',
		value = $bindable(),
		class: className,
		id: idPropio,
		...restProps
	}: Props = $props();

	const idAuto = $props.id();
	const id = $derived(idPropio ?? idAuto);
	const describedBy = $derived(
		[hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

<div class={className}>
	{#if label}
		<label for={id} class="mb-1.5 block text-sm font-medium text-light-two dark:text-dark-two">
			{label}
			{#if restProps.required}<span
					class="text-light-accent_d dark:text-dark-accent"
					aria-hidden="true"
				>
					*
				</span>{/if}
		</label>
	{/if}
	<select
		{...restProps}
		{id}
		bind:value
		aria-invalid={error ? true : undefined}
		aria-describedby={describedBy}
		class={cn(
			'block w-full rounded-xl border border-light-four bg-light-one pr-9 pl-3.5 text-light-two transition-[border-color,box-shadow] outline-none hover:border-light-four_d focus:border-light-three focus:ring-2 focus:ring-light-three/15 disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-four dark:bg-dark-one dark:text-dark-two dark:hover:border-dark-four_d dark:focus:border-dark-three dark:focus:ring-dark-three/25',
			size === 'sm' ? 'h-9 text-sm' : 'h-11 text-[0.9375rem]',
			error && 'border-light-error focus:border-light-error dark:border-dark-error'
		)}
	>
		{@render children()}
	</select>
	{#if hint && !error}
		<p id="{id}-hint" class="mt-1.5 text-xs text-light-two_d dark:text-dark-two_d">{hint}</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="mt-1.5 text-xs font-medium text-light-error dark:text-dark-error">
			{error}
		</p>
	{/if}
</div>
