<script lang="ts">
	import type { TarjetaPublica } from '#lib/interfaces/index.ts';
	import { iniciales, nombreCompleto } from '#lib/utils/tarjeta.ts';

	interface Props {
		tarjeta: Pick<
			TarjetaPublica,
			| 'prefijo'
			| 'nombres'
			| 'apellidos'
			| 'cargo'
			| 'nombre_empresa'
			| 'nombre_empresa_posicion'
			| 'logo_empresa_url'
			| 'profile_url'
			| 'cover_url'
			| 'rubro'
		>;
		/** h1 en la página pública; h2 dentro de otras páginas */
		nivel?: 'h1' | 'h2';
	}

	let { tarjeta, nivel = 'h1' }: Props = $props();

	const nombre = $derived(nombreCompleto(tarjeta));
	const posicion = $derived(tarjeta.nombre_empresa_posicion);
	const empresa = $derived(tarjeta.nombre_empresa);
	const logo = $derived(tarjeta.logo_empresa_url);
	const insignia = $derived((posicion === 'izquierda' || posicion === 'derecha') && !!logo);
	const empresaBajoCargo = $derived(!!empresa && posicion !== 'arriba' && posicion !== 'oculto');
</script>

<header>
	<div class="relative h-40 overflow-hidden bg-t-primario @md:h-44">
		{#if tarjeta.cover_url}
			<img
				src={tarjeta.cover_url}
				alt=""
				fetchpriority="high"
				decoding="async"
				class="absolute inset-0 size-full object-cover"
			/>
		{:else}
			<!-- Sin portada: trama de puntos sobre el color principal -->
			<div
				class="absolute inset-0 [background-image:radial-gradient(var(--t-sobre-primario)_1.3px,transparent_1.3px)] [background-size:18px_18px] opacity-25"
			></div>
		{/if}
		<div class="absolute inset-0 bg-t-overlay" style="opacity: var(--t-overlay-opacidad)"></div>
		{#if posicion === 'arriba' && (empresa || logo)}
			<div
				class="absolute inset-x-4 top-4 flex items-center gap-2.5 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]"
			>
				{#if logo}
					<img src={logo} alt="" class="size-9 shrink-0 rounded-lg object-cover shadow-sm" />
				{/if}
				{#if empresa}<span class="truncate text-sm font-semibold">{empresa}</span>{/if}
			</div>
		{/if}
	</div>

	<div class="relative -mt-16 flex flex-col items-center px-5 text-center">
		<div class="relative">
			{#if tarjeta.profile_url}
				<img
					src={tarjeta.profile_url}
					alt="Foto de {nombre}"
					decoding="async"
					class="size-32 rounded-full border-4 border-t-fondo bg-t-secundario object-cover shadow-md @4xl:border-t-superficie"
				/>
			{:else}
				<span
					class="grid size-32 place-items-center rounded-full border-4 border-t-fondo bg-t-secundario font-t-titulos text-4xl text-t-sobre-secundario @4xl:border-t-superficie"
					aria-hidden="true"
				>
					{iniciales(tarjeta)}
				</span>
			{/if}
			{#if insignia}
				<img
					src={logo}
					alt={empresa ? `Logo de ${empresa}` : 'Logo'}
					class={[
						'absolute bottom-0 size-11 rounded-xl border-[3px] border-t-fondo object-cover shadow @4xl:border-t-superficie',
						posicion === 'izquierda' ? '-left-1' : '-right-1'
					]}
				/>
			{/if}
		</div>

		<svelte:element
			this={nivel}
			class="mt-4 font-t-titulos text-[1.75rem] leading-[1.15] text-balance text-t-titulo"
			style="font-weight: var(--t-peso-titulos)"
		>
			{nombre}
		</svelte:element>
		<p class="mt-1.5 text-[1.0625rem] text-t-texto">{tarjeta.cargo ?? tarjeta.rubro}</p>
		{#if empresaBajoCargo}
			<p class="mt-0.5 font-semibold text-t-primario">{empresa}</p>
		{/if}
	</div>
</header>
