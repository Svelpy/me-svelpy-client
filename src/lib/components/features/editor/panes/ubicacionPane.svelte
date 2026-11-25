<script lang="ts">
	import { MapPinIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaUbicacion, TarjetaUbicacionInput } from '#lib/interfaces/index.ts';
	import { resumenSemanal } from '#lib/utils/horarios.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import UbicacionForm from '../formularios/ubicacionForm.svelte';
	import PanelLista from '../panelLista.svelte';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const servicio = editor.servicioLista<'ubicaciones', TarjetaUbicacionInput>('ubicaciones');

	function resumenHorario(ubicacion: TarjetaUbicacion): string {
		if (ubicacion.horarios.length === 0) return 'Sin horarios';
		return resumenSemanal(ubicacion.horarios)
			.filter((grupo) => grupo.horas !== 'Cerrado')
			.map((grupo) => `${grupo.dias} ${grupo.horas}`)
			.join('. ');
	}
</script>

<EditorPanel
	titulo="Ubicaciones"
	descripcion="Dónde atiendes y en qué horarios. Con las coordenadas, Google y las IAs te ubican en el mapa."
	{alVolver}
>
	<TituloSeccion clave="ubicacion" />
	<div class="mt-6">
		<PanelLista
			items={ordenar(editor.tarjeta.ubicaciones)}
			{servicio}
			nombre={(u) => u.nombre ?? u.direccion}
			singular="ubicación"
			plural="ubicaciones"
			agregarLabel="Agregar ubicación"
			femenino
			vacio={{
				titulo: 'Sin ubicaciones',
				descripcion: 'Agrega tu consultorio, oficina o local con sus horarios.',
				icono: MapPinIcon
			}}
		>
			{#snippet fila(ubicacion: TarjetaUbicacion)}
				<p class="truncate font-medium">{ubicacion.nombre ?? ubicacion.direccion}</p>
				<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
					{ubicacion.nombre ? `${ubicacion.direccion}. ` : ''}{resumenHorario(ubicacion)}
				</p>
			{/snippet}
			{#snippet formulario({
				inicial,
				id,
				guardar
			}: {
				inicial: TarjetaUbicacion | null;
				id: string;
				guardar: (datos: TarjetaUbicacionInput) => Promise<void>;
			})}
				<UbicacionForm {inicial} {id} {guardar} />
			{/snippet}
		</PanelLista>
	</div>
</EditorPanel>
