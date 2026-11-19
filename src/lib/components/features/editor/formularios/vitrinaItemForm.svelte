<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, Select, Switch, TextArea } from '#lib/components/ui/index.ts';
	import type {
		VitrinaCompleta,
		VitrinaItem,
		VitrinaItemCreateRequest,
		VitrinaItemImagenInput
	} from '#lib/interfaces/index.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import { vitrinaItemSchema } from '#lib/zod/vitrina.schema.ts';
	import { EstadoFormulario, numeroONull } from '../estadoFormulario.svelte.ts';
	import ImagenesItem from './imagenesItem.svelte';

	interface Props {
		id: string;
		inicial: VitrinaItem | null;
		vitrina: VitrinaCompleta;
		guardar: (datos: VitrinaItemCreateRequest) => Promise<void>;
	}

	let { id, inicial, vitrina, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let titulo = $state(base?.titulo ?? '');
	let descripcion = $state(base?.descripcion ?? '');
	let categoria = $state(base?.categoria_id ?? '');
	let precio = $state(base?.precio?.toString() ?? '');
	let precioAnterior = $state(base?.precio_anterior?.toString() ?? '');
	let precioEtiqueta = $state(base?.precio_etiqueta ?? '');
	let campos = $state([
		base?.campo1 ?? '',
		base?.campo2 ?? '',
		base?.campo3 ?? '',
		base?.campo4 ?? ''
	]);
	let destacado = $state(base?.destacado ?? false);
	let imagenes = $state<VitrinaItemImagenInput[]>(
		base?.imagenes.map(({ url, alt }) => ({ url, alt })) ?? []
	);
	const estado = new EstadoFormulario();
	const sugerencias = $props.id();

	const categorias = $derived(ordenar(vitrina.categorias));
	const nombresCampos = $derived([
		vitrina.campo1_nombre,
		vitrina.campo2_nombre,
		vitrina.campo3_nombre,
		vitrina.campo4_nombre
	]);

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			vitrinaItemSchema,
			{
				titulo,
				descripcion,
				categoria_id: categoria || null,
				precio: numeroONull(precio),
				precio_anterior: numeroONull(precioAnterior),
				precio_etiqueta: precioEtiqueta,
				campo1: campos[0],
				campo2: campos[1],
				campo3: campos[2],
				campo4: campos[3],
				destacado,
				imagenes
			},
			guardar
		);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Título"
		required
		maxlength={150}
		bind:value={titulo}
		error={estado.errores.titulo}
	/>
	<TextArea
		label="Descripción"
		rows={3}
		maxlength={1000}
		contador
		bind:value={descripcion}
		error={estado.errores.descripcion}
	/>
	{#if categorias.length > 0}
		<Select label="Categoría" bind:value={categoria} error={estado.errores.categoria_id}>
			<option value="">Sin categoría</option>
			{#each categorias as opcion (opcion.id)}<option value={opcion.id}>
					{opcion.nombre}
				</option>{/each}
		</Select>
	{/if}
	<div class="grid gap-5 sm:grid-cols-3">
		<Input
			label="Precio ({vitrina.moneda})"
			inputmode="decimal"
			placeholder="Vacío = a consultar"
			bind:value={precio}
			error={estado.errores.precio}
		/>
		<Input
			label="Precio anterior"
			inputmode="decimal"
			hint="Se muestra tachado."
			bind:value={precioAnterior}
			error={estado.errores.precio_anterior}
		/>
		<Input
			label="Etiqueta del precio"
			list={sugerencias}
			placeholder="Desde, por mes…"
			maxlength={50}
			bind:value={precioEtiqueta}
			error={estado.errores.precio_etiqueta}
		/>
	</div>
	<datalist id={sugerencias}>
		{#each ['Desde', 'por sesión', 'por mes', 'por persona', 'por hora'] as opcion (opcion)}<option
				value={opcion}
			></option>{/each}
	</datalist>
	{#if !vitrina.mostrar_precios}
		<p class="text-xs text-light-two_d dark:text-dark-two_d">
			Los precios están ocultos en tu vitrina: los visitantes verán «Precio a consultar».
		</p>
	{/if}
	{#if nombresCampos.some(Boolean)}
		<div class="grid gap-5 sm:grid-cols-2">
			{#each nombresCampos as nombre, indice (indice)}
				{#if nombre}
					<Input
						label={nombre}
						maxlength={100}
						bind:value={campos[indice]}
						error={estado.errores[`campo${indice + 1}`]}
					/>
				{/if}
			{/each}
		</div>
	{/if}
	<Switch
		label="Destacado"
		descripcion="Lleva la insignia «Destacado» en la vitrina."
		bind:checked={destacado}
	/>
	<ImagenesItem bind:imagenes />
</form>
