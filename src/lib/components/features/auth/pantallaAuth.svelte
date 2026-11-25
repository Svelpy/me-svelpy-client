<!--
	Marco de las pantallas de acceso que llegan desde un correo o lo envían (recuperar, restablecer,
	verificar): el mismo de "Entra a tu panel", con una sola tarea por pantalla.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { LOGOS_ME } from '#lib/constants/index.ts';

	interface Props {
		/** Título de la pestaña */
		pestana: string;
		titulo: string;
		descripcion?: string;
		children: Snippet;
		/** Enlaces bajo el contenido */
		pie?: Snippet;
	}

	let { pestana, titulo, descripcion, children, pie }: Props = $props();
</script>

<MainLayout title="{pestana} | ME" noIndex>
	<main class="mx-auto flex min-h-dvh w-full max-w-[25rem] flex-col justify-center px-5 py-16">
		<a
			href={resolve('/')}
			class="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-three dark:focus-visible:outline-dark-three"
		>
			<img
				src={LOGOS_ME.isotipoClaro}
				alt="ME, ir a la página principal"
				width="54"
				height="32"
				class="h-8 w-auto dark:hidden"
			/>
			<img
				src={LOGOS_ME.isotipoOscuro}
				alt="ME, ir a la página principal"
				width="54"
				height="32"
				class="hidden h-8 w-auto dark:block"
			/>
		</a>

		<h1
			class="mt-10 font-display text-[2rem] leading-tight font-semibold tracking-[-0.015em] text-balance"
		>
			{titulo}
		</h1>
		{#if descripcion}
			<p class="mt-2 text-[0.9375rem] text-light-two_d dark:text-dark-two_d">{descripcion}</p>
		{/if}

		<div class="mt-8">{@render children()}</div>

		{#if pie}
			<div class="mt-6 space-y-2 text-sm text-light-two_d dark:text-dark-two_d">
				{@render pie()}
			</div>
		{/if}
	</main>
</MainLayout>
