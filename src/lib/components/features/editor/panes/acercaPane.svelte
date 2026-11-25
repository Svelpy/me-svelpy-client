<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Button, TextArea } from '#lib/components/ui/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { textoOpcional } from '#lib/zod/common.ts';
	import { z } from 'zod';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	let texto = $state(untrack(() => editor.tarjeta.acerca_de_mi ?? ''));
	const estado = new EstadoFormulario();
	const esquema = z.object({ acerca_de_mi: textoOpcional('El texto', 1500) });

	const valor = $derived(texto.trim() || null);
	const cambiado = $derived(valor !== editor.tarjeta.acerca_de_mi);

	$effect(() => {
		editor.previsualizar(cambiado ? { acerca_de_mi: valor } : null, cambiado);
	});
	$effect(() => () => editor.previsualizar(null, false));

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(esquema, { acerca_de_mi: texto }, async (validos) => {
			await editor.guardarDatos(validos);
			alert('success', 'Cambios guardados');
		});
	}
</script>

<EditorPanel
	titulo="Acerca de mí"
	descripcion="Quién eres y cómo trabajas. Escríbelo como se lo contarías a un cliente."
	{alVolver}
>
	<TituloSeccion clave="acerca" />
	<form id="form-acerca" onsubmit={enviar} novalidate class="mt-6 space-y-4">
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
		<TextArea
			label="Tu presentación"
			rows={8}
			maxlength={1500}
			contador
			hint="Dos o tres párrafos cortos se leen mejor en el celular."
			bind:value={texto}
			error={estado.errores.acerca_de_mi}
		/>
	</form>
	{#snippet pie()}
		<Button type="submit" form="form-acerca" loading={estado.enviando} disabled={!cambiado}>
			Guardar cambios
		</Button>
	{/snippet}
</EditorPanel>
