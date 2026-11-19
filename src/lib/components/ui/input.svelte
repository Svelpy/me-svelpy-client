<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils/cn.ts';

	type InputSize = 'sm' | 'md' | 'lg';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		label?: string;
		/** Ayuda bajo el campo (se oculta mientras hay error) */
		hint?: string;
		error?: string;
		icon?: Component<{ class?: string }>;
		/** Contenido al final del campo (p. ej. mostrar contraseña) */
		trailing?: Snippet;
		size?: InputSize;
		/** Con `maxlength`, muestra "12/70" junto a la etiqueta */
		contador?: boolean;
		/** El valor en monoespaciada (direcciones, contraseñas generadas); la etiqueta no cambia */
		mono?: boolean;
		value?: string | number | null;
		/** Clases del contenedor (etiqueta + campo + ayuda) */
		class?: string;
	}

	let {
		label,
		hint,
		error,
		icon: Icono,
		trailing,
		size = 'md',
		contador = false,
		mono = false,
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
	const largo = $derived(String(value ?? '').length);

	const sizes: Record<InputSize, string> = {
		sm: 'h-9 px-3 text-sm',
		md: 'h-11 px-3.5 text-[0.9375rem]',
		lg: 'h-12 px-4 text-base'
	};
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
	<div class="relative">
		{#if Icono}
			<Icono
				class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-light-four_d dark:text-dark-four_d"
			/>
		{/if}
		<input
			{...restProps}
			{id}
			bind:value
			aria-invalid={error ? true : undefined}
			aria-describedby={describedBy}
			class={cn(
				'block w-full rounded-xl border border-light-four bg-light-one text-light-two transition-[border-color,box-shadow] outline-none placeholder:text-light-four_d hover:border-light-four_d focus:border-light-three focus:ring-2 focus:ring-light-three/15 disabled:cursor-not-allowed disabled:bg-light-one_d disabled:opacity-70 dark:border-dark-four dark:bg-dark-one dark:text-dark-two dark:placeholder:text-dark-four_d dark:hover:border-dark-four_d dark:focus:border-dark-three dark:focus:ring-dark-three/25 dark:disabled:bg-dark-one_d',
				sizes[size],
				mono && 'font-mono',
				Icono && 'pl-10',
				trailing && 'pr-12',
				error &&
					'border-light-error hover:border-light-error focus:border-light-error focus:ring-light-error/20 dark:border-dark-error dark:focus:border-dark-error'
			)}
		/>
		{#if trailing}
			<div class="absolute inset-y-0 right-1 flex items-center">{@render trailing()}</div>
		{/if}
	</div>
	{#if hint && !error}
		<p id="{id}-hint" class="mt-1.5 text-xs text-light-two_d dark:text-dark-two_d">{hint}</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="mt-1.5 text-xs font-medium text-light-error dark:text-dark-error">
			{error}
		</p>
	{/if}
</div>
