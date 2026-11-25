<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, Switch, TextArea } from '#lib/components/ui/index.ts';
	import type { TarjetaEducacion, TarjetaEducacionInput } from '#lib/interfaces/index.ts';
	import { tarjetaEducacionSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: TarjetaEducacion | null;
		guardar: (datos: TarjetaEducacionInput) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let institucion = $state(base?.institucion ?? '');
	let titulo = $state(base?.titulo ?? '');
	let areaEstudio = $state(base?.area_estudio ?? '');
	let fechaInicio = $state(base?.fecha_inicio ?? '');
	let fechaFin = $state(base?.fecha_fin ?? '');
	let isActual = $state(base?.is_actual ?? false);
	let descripcion = $state(base?.descripcion ?? '');
	const estado = new EstadoFormulario();

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			tarjetaEducacionSchema,
			{
				institucion,
				titulo,
				area_estudio: areaEstudio,
				fecha_inicio: fechaInicio,
				fecha_fin: isActual ? null : fechaFin,
				is_actual: isActual,
				descripcion
			},
			guardar
		);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Institución"
		required
		maxlength={200}
		bind:value={institucion}
		error={estado.errores.institucion}
	/>
	<div class="grid gap-5 sm:grid-cols-2">
		<Input
			label="Título obtenido"
			placeholder="Licenciatura en…"
			maxlength={200}
			bind:value={titulo}
			error={estado.errores.titulo}
		/>
		<Input
			label="Área de estudio"
			maxlength={200}
			bind:value={areaEstudio}
			error={estado.errores.area_estudio}
		/>
	</div>
	<div class="grid gap-5 sm:grid-cols-2">
		<Input
			label="Inicio"
			type="date"
			bind:value={fechaInicio}
			error={estado.errores.fecha_inicio}
		/>
		<Input
			label="Fin"
			type="date"
			bind:value={fechaFin}
			disabled={isActual}
			error={estado.errores.fecha_fin}
		/>
	</div>
	<Switch label="Lo sigo cursando" bind:checked={isActual} />
	<TextArea
		label="Descripción"
		rows={3}
		maxlength={1000}
		contador
		bind:value={descripcion}
		error={estado.errores.descripcion}
	/>
</form>
