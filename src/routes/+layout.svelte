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
	<link rel="icon" href={favicon} type="image/svg+xml" />
</svelte:head>

{@render children()}
