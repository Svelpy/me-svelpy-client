<script lang="ts">
	import { CONTACTO_TIPO_LABEL } from '#lib/constants/data.ts';
	import { MailIcon, PhoneIcon, WorldWwwIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaContacto, TarjetaContactoInput } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import CampoImagen from '../campoImagen.svelte';
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
	// Un solo principal por tipo: al marcar uno, los demás de su tipo dejan de serlo
	const servicio = editor.servicioLista<'contactos', TarjetaContactoInput>(
		'contactos',
		(lista, cambiado) => {
			const elegido = lista[cambiado];
			if (!elegido?.is_primary) return lista;
			return lista.map((contacto, indice) =>
				indice !== cambiado && contacto.tipo === elegido.tipo && contacto.is_primary
					? { ...contacto, is_primary: false }
					: contacto
			);
		}
	);
	const iconos = { phone: PhoneIcon, email: MailIcon, website: WorldWwwIcon };

	/** El QR se guarda en cuanto se elige (o se quita) */
	async function guardarQr(url: string | null) {
		try {
			await editor.guardarDatos({ qr_pago_url: url });
			alert('success', url ? 'QR de pago guardado' : 'QR de pago quitado');
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}
</script>

<EditorPanel
	titulo="Contacto"
	descripcion="Teléfonos, correos y sitios web. El principal de cada tipo va primero en todo y es el que usa el botón flotante."
	{alVolver}
>
	<TituloSeccion clave="contacto" />
	<div class="mt-6">
		<PanelLista
			items={ordenar(editor.tarjeta.contactos)}
			{servicio}
			nombre={(c) => c.etiqueta ?? c.valor}
			singular="contacto"
			plural="contactos"
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
				guardar: (datos: TarjetaContactoInput) => Promise<void>;
			})}
				<ContactoForm {inicial} {id} {guardar} />
			{/snippet}
		</PanelLista>
	</div>
	<CampoImagen
		id="qr-pago"
		label="QR de pago"
		tipo="qr_pago"
		hint="El QR de cobro de tu banco. Suma el botón «Pagar con QR» a esta sección y se guarda al elegirlo."
		value={editor.tarjeta.qr_pago_url}
		onchange={guardarQr}
		class="mt-10 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
	/>
</EditorPanel>
