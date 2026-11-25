<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, TextArea } from '#lib/components/ui/index.ts';
	import type { TarjetaFaq, TarjetaFaqInput } from '#lib/interfaces/index.ts';
	import { tarjetaFaqSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: TarjetaFaq | null;
		guardar: (datos: TarjetaFaqInput) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let pregunta = $state(base?.pregunta ?? '');
	let respuesta = $state(base?.respuesta ?? '');
	const estado = new EstadoFormulario();

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(tarjetaFaqSchema, { pregunta, respuesta }, guardar);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Pregunta"
		placeholder="¿Aceptan seguros médicos?"
		required
		maxlength={300}
		bind:value={pregunta}
		error={estado.errores.pregunta}
	/>
	<TextArea
		label="Respuesta"
		required
		rows={5}
		maxlength={2000}
		contador
		bind:value={respuesta}
		error={estado.errores.respuesta}
	/>
</form>
