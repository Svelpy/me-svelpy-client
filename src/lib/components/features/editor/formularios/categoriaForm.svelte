<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input } from '#lib/components/ui/index.ts';
	import type { VitrinaCategoria, VitrinaCategoriaCreateRequest } from '#lib/interfaces/index.ts';
	import { vitrinaCategoriaSchema } from '#lib/zod/vitrina.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: VitrinaCategoria | null;
		guardar: (datos: VitrinaCategoriaCreateRequest) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	let nombre = $state(untrack(() => inicial?.nombre ?? ''));
	const estado = new EstadoFormulario();

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(vitrinaCategoriaSchema, { nombre }, guardar);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Nombre de la categoría"
		placeholder="Venta, Alquiler, Tratamientos…"
		hint="Los visitantes la usan para filtrar tu vitrina."
		required
		maxlength={60}
		bind:value={nombre}
		error={estado.errores.nombre}
	/>
</form>
