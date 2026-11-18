<script lang="ts">
	import { resolve } from '$app/paths';
	import { LANDING_LINKS, LOGOS } from '../landing.content.ts';

	const anio = new Date().getFullYear();
</script>

<footer class="border-t border-primary-800 bg-primary-950 text-sm text-primary-400">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8"
	>
		<a
			href={resolve('/')}
			class="w-fit rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
		>
			<img
				src={LOGOS.completoOscuro}
				alt="ME by Svelpy"
				class="h-14 w-auto"
				width="80"
				height="56"
			/>
		</a>

		<div class="flex flex-col gap-3 md:items-end">
			<!-- eslint-disable svelte/no-navigation-without-resolve -- sitio externo: no es una ruta de la app -->
			<a
				href={LANDING_LINKS.svelpy}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex w-fit items-center gap-1 rounded-md transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
			>
				Un producto desarrollado por
				<img
					src={LOGOS.svelpyBlanco}
					alt="Svelpy"
					class="-my-2 h-10 w-auto"
					width="107"
					height="40"
				/>
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			<p>© {anio} Svelpy. Todos los derechos reservados.</p>
		</div>
	</div>
</footer>
