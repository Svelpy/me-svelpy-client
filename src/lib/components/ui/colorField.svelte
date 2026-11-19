<script lang="ts">
	import { untrack } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';
	import { normalizarHex } from '#lib/utils/color.ts';

	interface Props {
		label: string;
		/** #RRGGBB */
		value: string;
		descripcion?: string;
		error?: string;
		onchange?: (hex: string) => void;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		descripcion,
		error,
		onchange,
		class: className
	}: Props = $props();

	const id = $props.id();
	let texto = $state(untrack(() => value));

	// Si el color cambia desde afuera (p. ej. al aplicar un preset), el campo de texto lo sigue
	$effect.pre(() => {
		const actual = value;
		untrack(() => {
			if (normalizarHex(texto) !== actual) texto = actual;
		});
	});

	function cambiar(hex: string) {
		value = hex;
		onchange?.(hex);
	}

	function desdeTexto(event: Event & { currentTarget: HTMLInputElement }) {
		texto = event.currentTarget.value;
		const hex = normalizarHex(texto);
		if (hex) cambiar(hex);
	}

	const invalido = $derived(!normalizarHex(texto));
</script>

<div class={cn('flex items-center gap-3', className)}>
	<label
		class="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-light-four/70 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-light-three dark:border-dark-four dark:has-[:focus-visible]:outline-dark-three"
		style:background={value}
	>
		<span class="sr-only">Elegir {label.toLowerCase()} en la paleta</span>
		<input
			type="color"
			value={value.toLowerCase()}
			oninput={(event) => {
				const hex = event.currentTarget.value.toUpperCase();
				texto = hex;
				cambiar(hex);
			}}
			class="absolute inset-0 size-full cursor-pointer opacity-0"
		/>
	</label>
	<div class="min-w-0 flex-1">
		<label for={id} class="block text-sm font-medium text-light-two dark:text-dark-two">
			{label}
		</label>
		{#if descripcion}
			<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">{descripcion}</p>
		{/if}
	</div>
	<input
		{id}
		value={texto}
		oninput={desdeTexto}
		onblur={() => (texto = value)}
		maxlength="7"
		spellcheck="false"
		autocomplete="off"
		aria-invalid={invalido || error ? true : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
		class={[
			'h-9 w-[5.75rem] shrink-0 rounded-lg border bg-light-one px-2 font-mono text-sm text-light-two uppercase outline-none focus:ring-2 dark:bg-dark-one dark:text-dark-two',
			invalido || error
				? 'border-light-error focus:ring-light-error/20 dark:border-dark-error'
				: 'border-light-four focus:border-light-three focus:ring-light-three/15 dark:border-dark-four dark:focus:border-dark-three'
		]}
	/>
</div>
{#if error}
	<p id="{id}-error" class="mt-1 text-xs font-medium text-light-error dark:text-dark-error">
		{error}
	</p>
{/if}
