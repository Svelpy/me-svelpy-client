<script lang="ts">
	import { fontFaceCss, type TipografiaTarjeta } from '#lib/config/tipografiasTarjeta.config.ts';

	interface Props {
		/** Una o varias (el selector del editor muestra todas) */
		tipografias: TipografiaTarjeta[];
		/** Precarga los archivos (solo para la tipografía de la tarjeta que se ve) */
		precargar?: boolean;
	}

	let { tipografias, precargar = true }: Props = $props();

	const css = $derived(fontFaceCss(tipografias));
	const archivos = $derived([
		...new Set(tipografias.flatMap((t) => [t.titulos.archivo, t.texto.archivo]))
	]);
	// Las reglas vienen de la configuración (no de datos del usuario)
	const estilo = $derived(`<style>${css}</style>`);
</script>

<!-- Fuentes locales del propio dominio: solo el woff2 latin de cada familia que se usa -->
<svelte:head>
	{#if precargar}
		{#each archivos as archivo (archivo)}
			<link rel="preload" as="font" type="font/woff2" href={archivo} crossorigin="anonymous" />
		{/each}
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html estilo}
</svelte:head>
