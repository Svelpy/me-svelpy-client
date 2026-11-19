<script lang="ts">
	import { CheckIcon, CopyIcon } from '#lib/icons/outline/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import Button from './button.svelte';

	interface Props {
		/** Lo que se copia */
		texto: string;
		label?: string;
		/** Solo el ícono (el label queda como nombre accesible) */
		soloIcono?: boolean;
		variant?: 'ghost' | 'secondary' | 'outline';
		size?: 'xs' | 'sm' | 'md';
		class?: string;
	}

	let {
		texto,
		label = 'Copiar enlace',
		soloIcono = false,
		variant = 'secondary',
		size = 'sm',
		class: className
	}: Props = $props();

	let copiado = $state(false);
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	async function copiar() {
		try {
			await navigator.clipboard.writeText(texto);
			copiado = true;
			clearTimeout(temporizador);
			temporizador = setTimeout(() => (copiado = false), 2000);
		} catch {
			alert('error', 'No se pudo copiar. Selecciona el texto y cópialo a mano.');
		}
	}
</script>

<Button
	{variant}
	{size}
	class={className}
	onclick={copiar}
	aria-label={soloIcono ? label : undefined}
	title={soloIcono ? label : undefined}
>
	{#snippet leftIcon()}
		{#if copiado}<CheckIcon class="size-4" />{:else}<CopyIcon class="size-4" />{/if}
	{/snippet}
	{#if !soloIcono}{copiado ? 'Copiado' : label}{/if}
</Button>
<span class="sr-only" aria-live="polite">{copiado ? 'Copiado al portapapeles' : ''}</span>
