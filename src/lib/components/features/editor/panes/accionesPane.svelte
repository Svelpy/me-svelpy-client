<script lang="ts">
	import { CheckIcon, MinusIcon } from '#lib/icons/outline/index.ts';
	import { errorService, tarjetaService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { contactoPrincipal, enlaceAgenda, whatsappPrincipal } from '#lib/utils/tarjeta.ts';
	import CampoImagen from '../campoImagen.svelte';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const t = $derived(editor.tarjeta);

	/** Cada botón sale de un dato de la tarjeta: aquí se ve cuál falta */
	const accesos = $derived([
		{
			nombre: 'Llamar',
			activo: !!contactoPrincipal(t.contactos, 'phone'),
			origen: 'Tu teléfono principal, en Contacto.'
		},
		{
			nombre: 'WhatsApp',
			activo: !!whatsappPrincipal(t.contactos),
			origen: 'Un teléfono marcado con WhatsApp, en Contacto.'
		},
		{
			nombre: 'Correo',
			activo: !!contactoPrincipal(t.contactos, 'email'),
			origen: 'Tu correo principal, en Contacto.'
		},
		{
			nombre: 'Ubicación',
			activo: t.ubicaciones.some((u) => u.is_visible),
			origen: 'Tu primera ubicación.'
		},
		{ nombre: 'Pagar', activo: !!t.qr_pago_url, origen: 'El QR de pago de abajo.' },
		{
			nombre: 'Agendar cita',
			activo: !!enlaceAgenda(t.sociales),
			origen: 'Un enlace de Calendly o Doctoralia, en Redes.'
		},
		{ nombre: 'Compartir', activo: true, origen: 'Siempre disponible.' }
	]);

	async function guardarQr(url: string | null) {
		try {
			editor.guardado(await tarjetaService.actualizar(t.id, { qr_pago_url: url }));
			alert('success', url ? 'QR de pago guardado' : 'QR de pago quitado');
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}
</script>

<EditorPanel
	titulo="Accesos rápidos"
	descripcion="Los botones bajo tu nombre. Aparecen solos cuando completas el dato que los alimenta."
	{alVolver}
>
	<TituloSeccion clave="acciones" />
	<ul
		class="mt-6 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 dark:divide-dark-one_d dark:border-dark-one_d"
	>
		{#each accesos as acceso (acceso.nombre)}
			<li class="flex items-start gap-3 px-4 py-3">
				<span
					class={[
						'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
						acceso.activo
							? 'bg-light-success/12 text-[color-mix(in_oklab,var(--color-light-success)_62%,black)] dark:text-dark-success'
							: 'bg-light-one_d text-light-four_d dark:bg-dark-one_d dark:text-dark-four_d'
					]}
				>
					{#if acceso.activo}<CheckIcon class="size-3.5" />{:else}<MinusIcon
							class="size-3.5"
						/>{/if}
				</span>
				<div class="min-w-0">
					<p class="font-medium">
						{acceso.nombre}<span class="sr-only">
							{acceso.activo ? ': se muestra' : ': no se muestra'}
						</span>
					</p>
					<p class="text-sm text-light-two_d dark:text-dark-two_d">{acceso.origen}</p>
				</div>
			</li>
		{/each}
	</ul>
	<CampoImagen
		id="qr-pago"
		label="QR de pago"
		tipo="qr_pago"
		hint="El QR de cobro de tu banco. Activa el botón «Pagar» y se guarda al elegirlo."
		value={t.qr_pago_url}
		onchange={guardarQr}
		class="mt-8"
	/>
</EditorPanel>
