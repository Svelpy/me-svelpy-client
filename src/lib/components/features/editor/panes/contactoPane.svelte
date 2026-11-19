<script lang="ts">
	import { CONTACTO_TIPO_LABEL } from '#lib/constants/data.ts';
	import { MailIcon, PhoneIcon, WorldWwwIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaContacto, TarjetaContactoCreateRequest } from '#lib/interfaces/index.ts';
	import { tarjetaContactoService } from '#lib/services/index.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import ContactoForm from '../formularios/contactoForm.svelte';
	import PanelLista from '../panelLista.svelte';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const iconos = { phone: PhoneIcon, email: MailIcon, website: WorldWwwIcon };
</script>

<EditorPanel
	titulo="Contacto"
	descripcion="Teléfonos, correos y sitios web. El principal de cada tipo va primero en todo."
	{alVolver}
>
	<TituloSeccion clave="contacto" />
	<div class="mt-6">
		<PanelLista
			items={ordenar(editor.tarjeta.contactos)}
			padreId={editor.tarjeta.id}
			servicio={tarjetaContactoService}
			aplicar={(contactos: TarjetaContacto[]) => editor.actualizar({ contactos })}
			nombre={(c) => c.etiqueta ?? c.valor}
			singular="contacto"
			agregarLabel="Agregar contacto"
			vacio={{
				titulo: 'Sin datos de contacto',
				descripcion: 'Agrega al menos un teléfono para que puedan llamarte o escribirte.',
				icono: PhoneIcon
			}}
		>
			{#snippet fila(contacto: TarjetaContacto)}
				{@const Icono = iconos[contacto.tipo]}
				<div class="flex items-center gap-3">
					<Icono class="size-5 shrink-0 text-light-two_d dark:text-dark-two_d" />
					<div class="min-w-0">
						<p class="truncate font-medium">{contacto.valor}</p>
						<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
							{contacto.etiqueta ?? CONTACTO_TIPO_LABEL[contacto.tipo]}{contacto.is_wpp
								? ', con WhatsApp'
								: ''}{contacto.is_primary ? ', principal' : ''}
						</p>
					</div>
				</div>
			{/snippet}
			{#snippet formulario({
				inicial,
				id,
				guardar
			}: {
				inicial: TarjetaContacto | null;
				id: string;
				guardar: (datos: TarjetaContactoCreateRequest) => Promise<void>;
			})}
				<ContactoForm {inicial} {id} {guardar} />
			{/snippet}
		</PanelLista>
	</div>
</EditorPanel>
