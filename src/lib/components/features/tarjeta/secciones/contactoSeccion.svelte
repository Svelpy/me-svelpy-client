<script lang="ts">
	import { MailIcon, PhoneIcon, WhatsappIcon, WorldWwwIcon } from '#lib/icons/outline/index.ts';
	import type { IconoForma, TarjetaContacto } from '#lib/interfaces/index.ts';
	import { CONTACTO_TIPO_LABEL } from '#lib/constants/data.ts';
	import { hrefContacto, urlSinProtocolo, whatsappUrl } from '#lib/utils/contacto.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import TarjetaIcono from '../ui/tarjetaIcono.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		contactos: TarjetaContacto[];
		forma: IconoForma;
	}

	let { titulo, contactos, forma }: Props = $props();

	const iconos = { phone: PhoneIcon, email: MailIcon, website: WorldWwwIcon };
	const visibles = $derived(ordenar(contactos).filter((c) => c.is_visible));
</script>

<TarjetaSeccion id="contacto" {titulo}>
	<ul
		class="divide-y divide-t-borde overflow-hidden rounded-2xl border border-t-borde bg-t-superficie"
	>
		{#each visibles as contacto (contacto.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<TarjetaIcono icono={iconos[contacto.tipo]} {forma} size="sm" />
				<a
					href={hrefContacto(contacto)}
					target={contacto.tipo === 'website' ? '_blank' : undefined}
					rel="external noopener noreferrer"
					class="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-t-primario"
				>
					<span class="block text-xs text-t-texto-sec">
						{contacto.etiqueta ?? CONTACTO_TIPO_LABEL[contacto.tipo]}
					</span>
					<span class="block truncate font-medium text-t-titulo">
						{contacto.tipo === 'website' ? urlSinProtocolo(contacto.valor) : contacto.valor}
					</span>
				</a>
				{#if contacto.tipo === 'phone' && contacto.is_wpp}
					<a
						href={whatsappUrl(
							contacto.valor,
							'Hola, vi tu tarjeta ME y quiero hacer una consulta.'
						)}
						target="_blank"
						rel="external noopener noreferrer"
						aria-label="Escribir por WhatsApp al {contacto.valor}"
						class="grid size-10 shrink-0 place-items-center rounded-full bg-t-fondo-icono text-t-icono focus-visible:outline-2 focus-visible:outline-t-primario"
					>
						<WhatsappIcon class="size-5" />
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</TarjetaSeccion>
