<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils/cn.ts';

	interface Props extends Omit<HTMLTextareaAttributes, 'children'> {
		label?: string;
		hint?: string;
		error?: string;
		/** Con `maxlength`, muestra "120/1500" junto a la etiqueta */
		contador?: boolean;
		value?: string | null;
		class?: string;
	}

	let {
		label,
		hint,
		error,
		contador = false,
		value = $bindable(),
		class: className,
		id: idPropio,
		rows = 4,
		...restProps
	}: Props = $props();

	const idAuto = $props.id();
	const id = $derived(idPropio ?? idAuto);
	const describedBy = $derived(
		[hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
			.filter(Boolean)
			.join(' ') || undefined
	);
	const largo = $derived((value ?? '').length);
</script>

<div class={className}>
	{#if label}
		<label
			for={id}
			class="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-light-two dark:text-dark-two"
		>
			<span>
				{label}
				{#if restProps.required}<span
						class="text-light-accent_d dark:text-dark-accent"
						aria-hidden="true"
					>
						*
					</span>{/if}
			</span>
			{#if contador && restProps.maxlength}
				<span
					class={[
						'text-xs font-normal tabular-nums',
						largo > Number(restProps.maxlength)
							? 'text-light-error dark:text-dark-error'
							: 'text-light-four_d dark:text-dark-four_d'
					]}
					aria-hidden="true"
				>
					{largo}/{restProps.maxlength}
				</span>
			{/if}
		</label>
	{/if}
	<textarea
		{...restProps}
		{id}
		{rows}
		bind:value
		aria-invalid={error ? true : undefined}
		aria-describedby={describedBy}
		class={cn(
			'block w-full resize-y rounded-xl border border-light-four bg-light-one px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-light-two transition-[border-color,box-shadow] outline-none placeholder:text-light-four_d hover:border-light-four_d focus:border-light-three focus:ring-2 focus:ring-light-three/15 disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-four dark:bg-dark-one dark:text-dark-two dark:placeholder:text-dark-four_d dark:hover:border-dark-four_d dark:focus:border-dark-three dark:focus:ring-dark-three/25',
			error &&
				'border-light-error focus:border-light-error focus:ring-light-error/20 dark:border-dark-error'
		)}></textarea>
	{#if hint && !error}
		<p id="{id}-hint" class="mt-1.5 text-xs text-light-two_d dark:text-dark-two_d">{hint}</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="mt-1.5 text-xs font-medium text-light-error dark:text-dark-error">
			{error}
		</p>
	{/if}
</div>
