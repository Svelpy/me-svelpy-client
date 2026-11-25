<script lang="ts">
	import { RED_SOCIAL_LABEL } from '#lib/constants/data.ts';
	import type { IconoForma, TarjetaSocialPublica } from '#lib/interfaces/index.ts';
	import { ICONOS_RED } from '../iconosRed';
	import TarjetaIcono from '../ui/tarjetaIcono.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		redes: TarjetaSocialPublica[];
		forma: IconoForma;
	}

	let { titulo, redes, forma }: Props = $props();
</script>

<TarjetaSeccion id="redes" {titulo}>
	<ul class="grid grid-cols-1 gap-2 @sm:grid-cols-2">
		{#each redes as social (social.id)}
			<li>
				<a
					href={social.url}
					target="_blank"
					rel="external noopener noreferrer"
					class="flex items-center gap-3 rounded-2xl border border-t-borde bg-t-superficie px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-t-primario"
				>
					<TarjetaIcono icono={ICONOS_RED[social.red]} {forma} variante="social" size="sm" />
					<span class="min-w-0">
						<span class="block font-semibold text-t-titulo">{RED_SOCIAL_LABEL[social.red]}</span>
						{#if social.username}
							<span class="block truncate text-sm text-t-texto-sec">@{social.username}</span>
						{/if}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</TarjetaSeccion>
