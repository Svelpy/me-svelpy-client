<script lang="ts">
	import { PhoneIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import type { FabPosicion, TarjetaContactoPublico } from '#lib/interfaces/index.ts';
	import { telUrl, whatsappUrl } from '#lib/utils/contacto.ts';
	import { contactoPrincipal, whatsappPrincipal } from '#lib/utils/tarjeta.ts';

	interface Props {
		contactos: TarjetaContactoPublico[];
		lado: FabPosicion;
		/** fija en la página; absoluta dentro de una vista previa */
		modo?: 'fija' | 'absoluta';
	}

	let { contactos, lado, modo = 'fija' }: Props = $props();

	const whatsapp = $derived(whatsappPrincipal(contactos));
	const telefono = $derived(contactoPrincipal(contactos, 'phone'));
</script>

{#if whatsapp || telefono}
	<a
		href={whatsapp
			? whatsappUrl(whatsapp.valor, 'Hola, vi tu tarjeta ME y quiero hacer una consulta.')
			: telUrl(telefono!.valor)}
		target={whatsapp ? '_blank' : undefined}
		rel="external noopener noreferrer"
		aria-label={whatsapp ? 'Escribir por WhatsApp' : 'Llamar'}
		class={[
			modo === 'fija' ? 'fixed' : 'absolute',
			'bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-t-fab text-t-fab-icono shadow-[0_8px_24px_-6px_rgb(0_0_0/0.45)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-t-fab motion-reduce:transition-none',
			lado === 'izquierda' ? 'left-5' : 'right-5'
		]}
	>
		{#if whatsapp}<WhatsappIcon class="size-7" />{:else}<PhoneIcon class="size-7" />{/if}
	</a>
{/if}
