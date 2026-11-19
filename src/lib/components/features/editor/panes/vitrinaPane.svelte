<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Button, Input, Select, Switch } from '#lib/components/ui/index.ts';
	import { MONEDAS } from '#lib/constants/data.ts';
	import { BuildindStoreIcon, PhotoIcon, TagIcon } from '#lib/icons/outline/index.ts';
	import type {
		VitrinaCategoria,
		VitrinaCategoriaCreateRequest,
		VitrinaItem,
		VitrinaItemCreateRequest
	} from '#lib/interfaces/index.ts';
	import {
		vitrinaCategoriaService,
		vitrinaItemService,
		vitrinaService
	} from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatearPrecio, ordenar } from '#lib/utils/tarjeta.ts';
	import { vitrinaSchema } from '#lib/zod/vitrina.schema.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';
	import CategoriaForm from '../formularios/categoriaForm.svelte';
	import VitrinaItemForm from '../formularios/vitrinaItemForm.svelte';
	import PanelLista from '../panelLista.svelte';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const vitrina = $derived(editor.tarjeta.vitrina);

	function desdeTarjeta() {
		const v = editor.tarjeta.vitrina;
		return {
			mostrar_precios: v.mostrar_precios,
			moneda: v.moneda,
			campos: [
				v.campo1_nombre ?? '',
				v.campo2_nombre ?? '',
				v.campo3_nombre ?? '',
				v.campo4_nombre ?? ''
			]
		};
	}

	let config = $state(untrack(desdeTarjeta));
	const estado = new EstadoFormulario();

	const datos = $derived({
		mostrar_precios: config.mostrar_precios,
		moneda: config.moneda,
		campo1_nombre: config.campos[0].trim() || null,
		campo2_nombre: config.campos[1].trim() || null,
		campo3_nombre: config.campos[2].trim() || null,
		campo4_nombre: config.campos[3].trim() || null
	});
	const cambiado = $derived(
		(Object.keys(datos) as (keyof typeof datos)[]).some((campo) => datos[campo] !== vitrina[campo])
	);

	$effect(() => {
		editor.previsualizar(
			cambiado ? { vitrina: { ...editor.tarjeta.vitrina, ...datos } } : null,
			cambiado
		);
	});
	$effect(() => () => editor.previsualizar(null, false));

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(vitrinaSchema, datos, async (validos) => {
			const respuesta = await vitrinaService.actualizar(editor.tarjeta.id, validos);
			editor.guardado({ vitrina: { ...editor.tarjeta.vitrina, ...respuesta } });
			config = desdeTarjeta();
			alert('success', 'Vitrina guardada');
		});
	}

	/** Al borrar una categoría sus ítems quedan sin categoría: se recarga la vitrina completa */
	async function aplicarCategorias(categorias: VitrinaCategoria[]) {
		editor.actualizar({ vitrina: { ...editor.tarjeta.vitrina, categorias } });
		editor.actualizar({ vitrina: await vitrinaService.obtener(editor.tarjeta.id) });
	}

	const nombreCategoria = (id: string | null) =>
		vitrina.categorias.find((c) => c.id === id)?.nombre;
</script>

<EditorPanel
	titulo="Vitrina"
	descripcion="Tus servicios o productos con foto y precio. Cada uno lleva un botón para consultarte por WhatsApp."
	{alVolver}
>
	<TituloSeccion clave="vitrina" />

	<section aria-labelledby="items-titulo" class="mt-8">
		<h3 id="items-titulo" class="font-display text-base font-semibold">Lo que ofreces</h3>
		<div class="mt-3">
			<PanelLista
				items={ordenar(vitrina.items)}
				padreId={vitrina.id}
				servicio={vitrinaItemService}
				aplicar={(items: VitrinaItem[]) =>
					editor.actualizar({ vitrina: { ...editor.tarjeta.vitrina, items } })}
				nombre={(i) => i.titulo}
				singular="ítem"
				agregarLabel="Agregar a la vitrina"
				vacio={{
					titulo: 'Tu vitrina está vacía',
					descripcion: 'Agrega tu servicio estrella con una foto y su precio.',
					icono: BuildindStoreIcon
				}}
			>
				{#snippet fila(item: VitrinaItem)}
					<div class="flex items-center gap-3">
						<span
							class="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-light-one_d text-light-four_d dark:bg-dark-one_d dark:text-dark-four_d"
						>
							{#if item.imagenes[0]}<img
									src={item.imagenes[0].url}
									alt=""
									class="size-full object-cover"
								/>{:else}<PhotoIcon class="size-5" />{/if}
						</span>
						<div class="min-w-0">
							<p class="truncate font-medium">
								{item.titulo}
								{#if item.destacado}<span
										class="ml-1 rounded-full bg-light-one_d px-1.5 py-0.5 text-[0.6875rem] font-semibold text-light-two_d dark:bg-dark-one_d dark:text-dark-two_d"
									>
										Destacado
									</span>{/if}
							</p>
							<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
								{item.precio !== null
									? formatearPrecio(item.precio, vitrina.moneda)
									: 'Precio a consultar'}{nombreCategoria(item.categoria_id)
									? `, ${nombreCategoria(item.categoria_id)}`
									: ''}
							</p>
						</div>
					</div>
				{/snippet}
				{#snippet formulario({
					inicial,
					id,
					guardar
				}: {
					inicial: VitrinaItem | null;
					id: string;
					guardar: (datos: VitrinaItemCreateRequest) => Promise<void>;
				})}
					<VitrinaItemForm {inicial} {id} {guardar} {vitrina} />
				{/snippet}
			</PanelLista>
		</div>
	</section>

	<section aria-labelledby="categorias-titulo" class="mt-10">
		<h3 id="categorias-titulo" class="font-display text-base font-semibold">Categorías</h3>
		<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
			Con dos o más, los visitantes pueden filtrar tu vitrina.
		</p>
		<div class="mt-3">
			<PanelLista
				items={ordenar(vitrina.categorias)}
				padreId={vitrina.id}
				servicio={vitrinaCategoriaService}
				aplicar={aplicarCategorias}
				nombre={(c) => c.nombre}
				singular="categoría"
				agregarLabel="Agregar categoría"
				femenino
				vacio={{
					titulo: 'Sin categorías',
					descripcion: 'Opcional: agrupa tus ítems (Venta, Alquiler, Tratamientos…).',
					icono: TagIcon
				}}
			>
				{#snippet fila(categoria: VitrinaCategoria)}
					<p class="truncate font-medium">{categoria.nombre}</p>
					<p class="text-xs text-light-two_d dark:text-dark-two_d">
						{vitrina.items.filter((i) => i.categoria_id === categoria.id).length} ítems
					</p>
				{/snippet}
				{#snippet formulario({
					inicial,
					id,
					guardar
				}: {
					inicial: VitrinaCategoria | null;
					id: string;
					guardar: (datos: VitrinaCategoriaCreateRequest) => Promise<void>;
				})}
					<CategoriaForm {inicial} {id} {guardar} />
				{/snippet}
			</PanelLista>
		</div>
	</section>

	<form
		id="form-vitrina"
		onsubmit={enviar}
		novalidate
		class="mt-10 space-y-5 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
	>
		<h3 class="font-display text-base font-semibold">Ajustes de la vitrina</h3>
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
		<Switch
			label="Mostrar precios"
			descripcion="Si lo apagas, cada ítem invita a consultar el precio."
			bind:checked={config.mostrar_precios}
		/>
		<Select label="Moneda" bind:value={config.moneda} class="sm:max-w-xs">
			{#each MONEDAS as moneda (moneda.codigo)}<option value={moneda.codigo}>
					{moneda.nombre}
				</option>{/each}
		</Select>
		<fieldset>
			<legend class="text-sm font-medium">Datos extra de cada ítem</legend>
			<p class="mt-0.5 text-xs text-light-two_d dark:text-dark-two_d">
				Por ejemplo Dormitorios y Superficie, o Duración. Vacío = no se usa.
			</p>
			<div class="mt-3 grid gap-3 sm:grid-cols-2">
				{#each config.campos as _, indice (indice)}
					<Input
						aria-label="Nombre del dato {indice + 1}"
						placeholder="Dato {indice + 1}"
						maxlength={40}
						bind:value={config.campos[indice]}
						error={estado.errores[`campo${indice + 1}_nombre`]}
					/>
				{/each}
			</div>
		</fieldset>
		{#if cambiado}
			<div class="flex justify-end">
				<Button type="submit" loading={estado.enviando}>Guardar ajustes</Button>
			</div>
		{/if}
	</form>
</EditorPanel>
