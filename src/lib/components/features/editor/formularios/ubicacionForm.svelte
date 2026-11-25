<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input } from '#lib/components/ui/index.ts';
	import { DEPARTAMENTOS_BOLIVIA, PAIS_POR_DEFECTO } from '#lib/constants/data.ts';
	import { LinkIcon, MapPinIcon } from '#lib/icons/outline/index.ts';
	import type {
		TarjetaUbicacion,
		TarjetaUbicacionInput,
		UbicacionHorarioInput
	} from '#lib/interfaces/index.ts';
	import { extraerCoordenadas } from '#lib/utils/extraerCoordenadas.ts';
	import { tarjetaUbicacionSchema } from '#lib/zod/tarjetaUbicacion.schema.ts';
	import { EstadoFormulario, numeroONull } from '../estadoFormulario.svelte.ts';
	import HorariosEditor from './horariosEditor.svelte';

	interface Props {
		id: string;
		inicial: TarjetaUbicacion | null;
		guardar: (datos: TarjetaUbicacionInput) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let nombre = $state(base?.nombre ?? '');
	let direccion = $state(base?.direccion ?? '');
	let ciudad = $state(base?.ciudad ?? '');
	let departamento = $state(base?.departamento ?? '');
	let pais = $state(base?.pais ?? PAIS_POR_DEFECTO);
	let mapsUrl = $state(base?.maps_url ?? '');
	let lat = $state(base?.lat?.toString() ?? '');
	let lng = $state(base?.lng?.toString() ?? '');
	let horarios = $state<UbicacionHorarioInput[]>(
		base?.horarios.map(({ dia_semana, hora_inicio, hora_fin }) => ({
			dia_semana,
			hora_inicio,
			hora_fin
		})) ?? []
	);
	let avisoCoordenadas = $state('');
	const estado = new EstadoFormulario();
	const listaDepartamentos = $props.id();

	/** Si el enlace de Google Maps trae coordenadas, se completan solas */
	function alCambiarMaps() {
		const coordenadas = extraerCoordenadas(mapsUrl);
		if (coordenadas) {
			lat = String(coordenadas.lat);
			lng = String(coordenadas.lng);
			avisoCoordenadas = 'Tomamos la latitud y la longitud del enlace.';
		}
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			tarjetaUbicacionSchema,
			{
				nombre,
				direccion,
				ciudad,
				departamento,
				pais,
				maps_url: mapsUrl,
				lat: numeroONull(lat),
				lng: numeroONull(lng),
				horarios
			},
			guardar
		);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<div class="grid gap-5 sm:grid-cols-2">
		<Input
			label="Nombre del lugar"
			placeholder="Consultorio Norte"
			maxlength={150}
			bind:value={nombre}
			error={estado.errores.nombre}
		/>
		<Input
			label="Dirección"
			icon={MapPinIcon}
			required
			maxlength={255}
			bind:value={direccion}
			error={estado.errores.direccion}
		/>
	</div>
	<div class="grid gap-5 sm:grid-cols-3">
		<Input label="Ciudad" maxlength={100} bind:value={ciudad} error={estado.errores.ciudad} />
		<Input
			label="Departamento"
			list={listaDepartamentos}
			maxlength={100}
			bind:value={departamento}
			error={estado.errores.departamento}
		/>
		<Input label="País" maxlength={100} bind:value={pais} error={estado.errores.pais} />
	</div>
	<datalist id={listaDepartamentos}>
		{#each DEPARTAMENTOS_BOLIVIA as opcion (opcion)}<option value={opcion}></option>{/each}
	</datalist>
	<Input
		label="Enlace de Google Maps"
		type="url"
		icon={LinkIcon}
		placeholder="https://maps.google.com/…"
		hint={avisoCoordenadas || 'Pega el enlace de tu ficha y tomamos las coordenadas.'}
		bind:value={mapsUrl}
		onchange={alCambiarMaps}
		onpaste={() => setTimeout(alCambiarMaps)}
		error={estado.errores.maps_url}
	/>
	<div class="grid gap-5 sm:grid-cols-2">
		<Input
			label="Latitud"
			inputmode="decimal"
			placeholder="-17.783300"
			bind:value={lat}
			error={estado.errores.lat}
		/>
		<Input
			label="Longitud"
			inputmode="decimal"
			placeholder="-63.182100"
			bind:value={lng}
			error={estado.errores.lng}
		/>
	</div>
	<HorariosEditor bind:horarios errores={estado.errores} />
</form>
