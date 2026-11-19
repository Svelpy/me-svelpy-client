<script lang="ts">
	import type { TarjetaPublica } from '#lib/interfaces/index.ts';
	import { construirJsonLd } from '#lib/utils/jsonLdTarjeta.ts';
	import {
		descripcionSeoTarjeta,
		imagenSeoTarjeta,
		tituloSeoTarjeta
	} from '#lib/utils/seoTarjeta.ts';

	interface Props {
		tarjeta: TarjetaPublica;
		/** URL canónica (me.svelpy.com/{slug}) */
		url: string;
	}

	let { tarjeta, url }: Props = $props();

	const titulo = $derived(tituloSeoTarjeta(tarjeta));
	const descripcion = $derived(descripcionSeoTarjeta(tarjeta));
	const imagen = $derived(imagenSeoTarjeta(tarjeta));
	const robots = $derived(tarjeta.seo.robots_index ? 'index, follow' : 'noindex, nofollow');
	// GEO: datos estructurados para Google y las IAs. Se escapa "<" para no cerrar el <script>
	const jsonLd = $derived(
		`<script type="application/ld+json">${JSON.stringify(construirJsonLd(tarjeta, url)).replace(/</g, '\\u003c')}</${'script'}>`
	);
</script>

<svelte:head>
	<title>{titulo}</title>
	<meta name="description" content={descripcion} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="profile" />
	<meta property="og:site_name" content="ME" />
	<meta property="og:locale" content="es_BO" />
	<meta property="og:title" content={titulo} />
	<meta property="og:description" content={descripcion} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imagen} />
	<meta property="profile:first_name" content={tarjeta.nombres} />
	{#if tarjeta.apellidos}<meta property="profile:last_name" content={tarjeta.apellidos} />{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={titulo} />
	<meta name="twitter:description" content={descripcion} />
	<meta name="twitter:image" content={imagen} />

	<meta name="theme-color" content={tarjeta.theme.color_fondo} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd}
</svelte:head>
