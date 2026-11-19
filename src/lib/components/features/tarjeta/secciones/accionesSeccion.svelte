<script lang="ts">
	import type { Component } from 'svelte';
	import {
		CalendarEventIcon,
		MailIcon,
		MapPinIcon,
		PhoneIcon,
		QrcodeIcon,
		ShareIcon,
		WhatsappIcon
	} from '#lib/icons/outline/index.ts';
	import type { TarjetaPublica } from '#lib/interfaces/index.ts';
	import { mailtoUrl, mapsUrl, telUrl, whatsappUrl } from '#lib/utils/contacto.ts';
	import {
		contactoPrincipal,
		enlaceAgenda,
		ordenar,
		whatsappPrincipal
	} from '#lib/utils/tarjeta.ts';
	import TarjetaBoton from '../ui/tarjetaBoton.svelte';
	import TarjetaIcono from '../ui/tarjetaIcono.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		tarjeta: TarjetaPublica;
		titulo: string;
		onPagar: () => void;
		onCompartir: () => void;
	}

	let { tarjeta, titulo, onPagar, onCompartir }: Props = $props();

	interface Acceso {
		etiqueta: string;
		icono: Component<{ class?: string }>;
		href?: string;
		externo?: boolean;
		accion?: () => void;
	}

	const accesos = $derived.by(() => {
		const telefono = contactoPrincipal(tarjeta.contactos, 'phone');
		const whatsapp = whatsappPrincipal(tarjeta.contactos);
		const correo = contactoPrincipal(tarjeta.contactos, 'email');
		const ubicacion = ordenar(tarjeta.ubicaciones)[0];
		const lista: (Acceso | false | undefined)[] = [
			telefono && { etiqueta: 'Llamar', icono: PhoneIcon, href: telUrl(telefono.valor) },
			whatsapp && {
				etiqueta: 'WhatsApp',
				icono: WhatsappIcon,
				href: whatsappUrl(whatsapp.valor, 'Hola, vi tu tarjeta ME y quiero hacer una consulta.'),
				externo: true
			},
			correo && { etiqueta: 'Correo', icono: MailIcon, href: mailtoUrl(correo.valor) },
			ubicacion && {
				etiqueta: 'Ubicación',
				icono: MapPinIcon,
				href: mapsUrl(ubicacion),
				externo: true
			},
			!!tarjeta.qr_pago_url && { etiqueta: 'Pagar', icono: QrcodeIcon, accion: onPagar },
			{ etiqueta: 'Compartir', icono: ShareIcon, accion: onCompartir }
		];
		return lista.filter((acceso): acceso is Acceso => !!acceso);
	});

	const agenda = $derived(enlaceAgenda(tarjeta.sociales));
	const forma = $derived(tarjeta.theme.icono_forma);
	const claseAcceso =
		'flex w-[4.75rem] flex-col items-center gap-2 rounded-2xl p-1 text-center text-sm font-medium text-t-texto focus-visible:outline-2 focus-visible:outline-t-primario';
</script>

<TarjetaSeccion id="acciones" {titulo} tituloOculto>
	<ul class="flex flex-wrap justify-center gap-x-3 gap-y-5">
		{#each accesos as acceso (acceso.etiqueta)}
			<li>
				{#if acceso.href}
					<a
						href={acceso.href}
						target={acceso.externo ? '_blank' : undefined}
						rel="external noopener noreferrer"
						class={claseAcceso}
					>
						<TarjetaIcono icono={acceso.icono} {forma} size="lg" />
						{acceso.etiqueta}
					</a>
				{:else}
					<button type="button" onclick={acceso.accion} class={claseAcceso}>
						<TarjetaIcono icono={acceso.icono} {forma} size="lg" />
						{acceso.etiqueta}
					</button>
				{/if}
			</li>
		{/each}
	</ul>
	{#if agenda}
		<TarjetaBoton
			href={agenda.url}
			externo
			variante="contorno"
			fullWidth
			icono={CalendarEventIcon}
			class="mt-6"
		>
			Agendar cita
		</TarjetaBoton>
	{/if}
</TarjetaSeccion>
