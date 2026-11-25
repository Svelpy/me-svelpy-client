<!--
	Una tarjeta del directorio: arriba, su portada, su foto y su nombre; abajo, en la tinta del panel,
	los datos de administración. El listado de la API no trae el tema, así que todas usan la misma
	paleta clara y neutra; los colores propios se ven al abrirla.
-->
<script lang="ts">
	import { TEMA_PRESET_POR_DEFECTO, TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import {
		familiaCss,
		TIPOGRAFIA_POR_DEFECTO,
		tipografiaPorId
	} from '#lib/config/tipografiasTarjeta.config.ts';
	import type { ResolvedPathname } from '$app/types';
	import type { TarjetaListItem } from '#lib/interfaces/index.ts';
	import { iniciales, nombreCompleto } from '#lib/utils/tarjeta.ts';
	import EstadoPublicacion from '../panel/estadoPublicacion.svelte';

	interface Props {
		tarjeta: TarjetaListItem;
		/** Ruta ya resuelta con resolve() */
		href: ResolvedPathname;
	}

	let { tarjeta, href }: Props = $props();

	const tema = TEMAS_TARJETA[TEMA_PRESET_POR_DEFECTO].colores;
	const tipografia = tipografiaPorId(TIPOGRAFIA_POR_DEFECTO);
	const nombre = $derived(nombreCompleto(tarjeta));
</script>

<a
	{href}
	class="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-light-four/45 bg-light-one transition-colors hover:border-light-four_d focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-three dark:border-dark-one_d dark:bg-dark-one dark:hover:border-dark-four dark:focus-visible:outline-dark-three"
>
	<div style:background={tema.color_fondo}>
		<div class="relative h-20 overflow-hidden" style:background={tema.color_primario}>
			{#if tarjeta.cover_url}
				<img
					src={tarjeta.cover_url}
					alt=""
					loading="lazy"
					decoding="async"
					class="absolute inset-0 size-full object-cover"
				/>
			{/if}
			<div
				class="absolute inset-0"
				style:background={tema.color_overlay_portada}
				style:opacity={tema.overlay_opacidad / 100}
			></div>
		</div>
		<div class="-mt-8 flex flex-col items-center px-4 pb-5 text-center">
			{#if tarjeta.profile_url}
				<img
					src={tarjeta.profile_url}
					alt=""
					loading="lazy"
					decoding="async"
					class="relative size-16 rounded-full border-[3px] object-cover"
					style:border-color={tema.color_fondo}
				/>
			{:else}
				<span
					class="relative grid size-16 place-items-center rounded-full border-[3px] text-lg font-semibold"
					style:border-color={tema.color_fondo}
					style:background={tema.color_primario}
					style:color={tema.color_texto_sobre_primario}
					aria-hidden="true"
				>
					{iniciales(tarjeta)}
				</span>
			{/if}
			<p
				class="mt-2.5 line-clamp-2 text-[1.0625rem] leading-snug text-balance"
				style:color={tema.color_titulo}
				style:font-family={familiaCss(tipografia.titulos)}
				style:font-weight={tipografia.pesoTitulos}
			>
				{nombre}
			</p>
			<p class="mt-0.5 line-clamp-1 text-sm" style:color={tema.color_texto_secundario}>
				{tarjeta.cargo ?? tarjeta.rubro}
			</p>
		</div>
	</div>
	<div
		class="mt-auto flex items-center justify-between gap-2 border-t border-light-four/40 px-4 py-3 dark:border-dark-one_d"
	>
		<span class="min-w-0 truncate font-mono text-xs text-light-two_d dark:text-dark-two_d">
			/{tarjeta.slug}
		</span>
		<EstadoPublicacion publicada={tarjeta.is_public} />
	</div>
</a>
