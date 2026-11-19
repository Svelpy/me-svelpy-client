<script lang="ts">
	import { ICONOS_RED } from '../../tarjeta/iconosRed';
	import { RED_SOCIAL_LABEL } from '#lib/constants/data.ts';
	import { ShareIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaSocial, TarjetaSocialCreateRequest } from '#lib/interfaces/index.ts';
	import { tarjetaSocialService } from '#lib/services/index.ts';
	import { urlSinProtocolo } from '#lib/utils/contacto.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import RedForm from '../formularios/redForm.svelte';
	import PanelLista from '../panelLista.svelte';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
</script>

<EditorPanel
	titulo="Redes"
	descripcion="Tus perfiles y tus enlaces para agendar. Calendly y Doctoralia activan el botón «Agendar cita»."
	{alVolver}
>
	<TituloSeccion clave="redes" />
	<div class="mt-6">
		<PanelLista
			items={ordenar(editor.tarjeta.sociales)}
			padreId={editor.tarjeta.id}
			servicio={tarjetaSocialService}
			aplicar={(sociales: TarjetaSocial[]) => editor.actualizar({ sociales })}
			nombre={(s) => RED_SOCIAL_LABEL[s.red]}
			singular="red"
			agregarLabel="Agregar red"
			femenino
			vacio={{
				titulo: 'Sin redes',
				descripcion: 'Pega el enlace de tu Instagram, LinkedIn o TikTok.',
				icono: ShareIcon
			}}
		>
			{#snippet fila(social: TarjetaSocial)}
				{@const Icono = ICONOS_RED[social.red]}
				<div class="flex items-center gap-3">
					<Icono class="size-5 shrink-0 text-light-two_d dark:text-dark-two_d" />
					<div class="min-w-0">
						<p class="truncate font-medium">{RED_SOCIAL_LABEL[social.red]}</p>
						<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
							{social.username ? `@${social.username}` : urlSinProtocolo(social.url)}
						</p>
					</div>
				</div>
			{/snippet}
			{#snippet formulario({
				inicial,
				id,
				guardar
			}: {
				inicial: TarjetaSocial | null;
				id: string;
				guardar: (datos: TarjetaSocialCreateRequest) => Promise<void>;
			})}
				<RedForm {inicial} {id} {guardar} />
			{/snippet}
		</PanelLista>
	</div>
</EditorPanel>
