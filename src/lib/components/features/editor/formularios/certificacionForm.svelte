<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, Switch, TextArea } from '#lib/components/ui/index.ts';
	import { LinkIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaCertificacion, TarjetaCertificacionInput } from '#lib/interfaces/index.ts';
	import { tarjetaCertificacionSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: TarjetaCertificacion | null;
		guardar: (datos: TarjetaCertificacionInput) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let nombre = $state(base?.nombre ?? '');
	let entidad = $state(base?.entidad_emisora ?? '');
	let codigo = $state(base?.codigo_credencial ?? '');
	let url = $state(base?.url_credencial ?? '');
	let emision = $state(base?.fecha_emision ?? '');
	let expiracion = $state(base?.fecha_expiracion ?? '');
	let noExpira = $state(base?.no_expira ?? false);
	let descripcion = $state(base?.descripcion ?? '');
	const estado = new EstadoFormulario();

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			tarjetaCertificacionSchema,
			{
				nombre,
				entidad_emisora: entidad,
				codigo_credencial: codigo,
				url_credencial: url,
				fecha_emision: emision,
				fecha_expiracion: noExpira ? null : expiracion,
				no_expira: noExpira,
				descripcion
			},
			guardar
		);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Nombre"
		required
		maxlength={200}
		bind:value={nombre}
		error={estado.errores.nombre}
	/>
	<div class="grid gap-5 sm:grid-cols-2">
		<Input
			label="Entidad emisora"
			maxlength={200}
			bind:value={entidad}
			error={estado.errores.entidad_emisora}
		/>
		<Input
			label="Código de la credencial"
			maxlength={150}
			bind:value={codigo}
			error={estado.errores.codigo_credencial}
		/>
	</div>
	<Input
		label="Enlace de verificación"
		type="url"
		icon={LinkIcon}
		placeholder="https://"
		hint="Donde un cliente puede comprobar que la credencial es real."
		bind:value={url}
		error={estado.errores.url_credencial}
	/>
	<div class="grid gap-5 sm:grid-cols-2">
		<Input label="Emitida" type="date" bind:value={emision} error={estado.errores.fecha_emision} />
		<Input
			label="Vence"
			type="date"
			bind:value={expiracion}
			disabled={noExpira}
			error={estado.errores.fecha_expiracion}
		/>
	</div>
	<Switch label="No vence" bind:checked={noExpira} />
	<TextArea
		label="Descripción"
		rows={3}
		maxlength={1000}
		contador
		bind:value={descripcion}
		error={estado.errores.descripcion}
	/>
</form>
