<script lang="ts">
	import { TarjetaSeo, TarjetaVista } from '#lib/components/features/tarjeta/index.ts';
	import { esOscuro } from '#lib/utils/color.ts';
	import { urlPublicaTarjeta } from '#lib/utils/urlPublica.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const url = $derived(urlPublicaTarjeta(data.tarjeta.slug));

	// El documento toma los colores de la tarjeta: el rebote del scroll y la barra del celular
	$effect(() => {
		const html = document.documentElement;
		const { color_fondo, color_borde } = data.tarjeta.theme;
		const anterior = html.getAttribute('style');
		html.style.backgroundColor = color_fondo;
		html.style.colorScheme = esOscuro(color_fondo) ? 'dark' : 'light';
		html.style.setProperty('--scrollbar-track', color_fondo);
		html.style.setProperty('--scrollbar-thumb', color_borde);
		return () => {
			if (anterior === null) html.removeAttribute('style');
			else html.setAttribute('style', anterior);
		};
	});
</script>

<TarjetaSeo tarjeta={data.tarjeta} {url} />
<TarjetaVista tarjeta={data.tarjeta} class="min-h-dvh" />
