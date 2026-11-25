<script lang="ts">
	import { ImageUploader } from '#lib/components/ui/index.ts';
	import type { ImagenTipo } from '#lib/interfaces/index.ts';
	import { FORMATOS_IMAGEN } from '#lib/utils/imagen.ts';
	import { errorService, imagenService } from '#lib/services/index.ts';

	interface Props {
		id: string;
		label: string;
		hint?: string;
		/** Define el tamaño al que se achica antes de subirla */
		tipo: ImagenTipo;
		/** URL guardada (null = sin imagen) */
		value: string | null;
		error?: string;
		onchange?: (url: string | null) => void;
		class?: string;
	}

	let {
		id,
		label,
		hint,
		tipo,
		value = $bindable(),
		error,
		onchange,
		class: className
	}: Props = $props();

	let archivo = $state<File | null>(null);
	let subiendo = $state(false);
	let errorSubida = $state('');

	/** La imagen se sube al elegirla; el formulario guarda solo su URL */
	async function subir(elegido: File | null) {
		if (!elegido) return;
		subiendo = true;
		errorSubida = '';
		try {
			const { url } = await imagenService.subir(elegido, tipo);
			value = url;
			onchange?.(url);
		} catch (causa) {
			errorSubida = errorService.getMessage(causa);
		} finally {
			subiendo = false;
			archivo = null;
		}
	}

	function quitar() {
		value = null;
		onchange?.(null);
	}
</script>

<div class={className}>
	<ImageUploader
		{id}
		{label}
		hint={subiendo ? 'Subiendo la imagen…' : hint}
		bind:value={archivo}
		currentUrl={value}
		accept={FORMATOS_IMAGEN}
		error={errorSubida || error}
		disabled={subiendo}
		onFileChange={subir}
	/>
	{#if value && !subiendo}
		<button
			type="button"
			onclick={quitar}
			class="mt-2 text-sm font-medium text-light-two_d underline decoration-light-four underline-offset-4 hover:text-light-two dark:text-dark-two_d dark:decoration-dark-four dark:hover:text-dark-two"
		>
			Quitar imagen
		</button>
	{/if}
</div>
