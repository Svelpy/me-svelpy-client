<!--
	Google Analytics 4 (gtag.js). Se activa solo si PUBLIC_GA_ID está definido y nunca en localhost,
	para que el dev server y los tests E2E no ensucien las estadísticas.
	Las navegaciones internas de SvelteKit se registran solas gracias a la "medición mejorada" de GA4
	(opción "Cambios de página según el historial del navegador", activa por defecto).
-->
<script lang="ts">
	import { PUBLIC_GA_ID } from '$app/env/public';

	// El ID ya viene validado (G-XXXXXXXXXX) por src/env.ts; JSON.stringify lo escapa igualmente.
	const id = JSON.stringify(PUBLIC_GA_ID ?? '');
	const script = `<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	if (!/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname)) {
		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ${id};
		document.head.appendChild(s);
		gtag('js', new Date());
		gtag('config', ${id});
	}
</${'script'}>`;
</script>

<svelte:head>
	{#if PUBLIC_GA_ID}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- snippet estático con ID validado -->
		{@html script}
	{/if}
</svelte:head>
