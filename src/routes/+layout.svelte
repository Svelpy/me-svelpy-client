<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/space-grotesk';
	import '@fontsource-variable/plus-jakarta-sans';
	import '@fontsource-variable/jetbrains-mono';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<!-- Íconos rasterizados: pnpm landing:iconos (scripts/landing/generar-iconos.mjs) -->
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

{@render children()}
