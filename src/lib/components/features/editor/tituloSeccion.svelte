<script lang="ts">
	import { untrack } from 'svelte';
	import { Button, Input } from '#lib/components/ui/index.ts';
	import { SECCIONES_TARJETA } from '#lib/config/seccionesTarjeta.config.ts';
	import type { SeccionClave } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { getEditor } from './estadoEditor.svelte.ts';

	interface Props {
		clave: SeccionClave;
	}

	let { clave }: Props = $props();

	const editor = getEditor();
	const seccion = $derived(editor.tarjeta.secciones.find((s) => s.clave === clave));
	let titulo = $state(untrack(() => seccion?.titulo ?? ''));
	let guardando = $state(false);
	let error = $state('');

	const cambiado = $derived((titulo.trim() || null) !== (seccion?.titulo ?? null));

	async function guardar() {
		if (!seccion) return;
		guardando = true;
		error = '';
		try {
			// La API recibe siempre las 8 secciones juntas
			const nuevo = titulo.trim() || null;
			await editor.guardarSecciones(
				ordenar(editor.tarjeta.secciones).map((s) =>
					s.id === seccion.id ? { ...s, titulo: nuevo } : s
				)
			);
			alert('success', 'Título guardado');
		} catch (causa) {
			const errores = errorService.getFieldErrors(causa);
			const propio = Object.entries(errores).find(([campo]) => campo.endsWith('titulo'));
			error = propio?.[1] ?? errorService.getMessage(causa);
		} finally {
			guardando = false;
		}
	}
</script>

<div
	class="flex flex-col gap-2 border-b border-light-four/40 pb-6 sm:flex-row sm:items-end dark:border-dark-one_d"
>
	<Input
		label="Título de la sección"
		placeholder={SECCIONES_TARJETA[clave].titulo}
		hint="Si lo dejas vacío, la tarjeta muestra «{SECCIONES_TARJETA[clave].titulo}»."
		maxlength={80}
		bind:value={titulo}
		{error}
		class="flex-1"
	/>
	{#if cambiado}
		<Button variant="secondary" loading={guardando} onclick={guardar} class="sm:mb-[1.375rem]">
			Guardar título
		</Button>
	{/if}
</div>
