<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { LOGOS_ME } from '#lib/constants/index.ts';

	const noExiste = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{noExiste ? 'Página no encontrada' : 'Algo salió mal'} | ME</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main
	data-area="app"
	class="grid min-h-dvh place-items-center bg-light-one px-6 py-16 font-sans text-light-two dark:bg-dark-one dark:text-dark-two"
>
	<div class="max-w-md text-center">
		<img
			src={LOGOS_ME.isotipoClaro}
			alt="ME"
			width="56"
			height="33"
			class="mx-auto h-8 w-auto dark:hidden"
		/>
		<img
			src={LOGOS_ME.isotipoOscuro}
			alt="ME"
			width="56"
			height="33"
			class="mx-auto hidden h-8 w-auto dark:block"
		/>
		<p
			class="mt-8 font-display text-sm font-semibold text-light-accent_d tabular-nums dark:text-dark-accent"
		>
			Error {page.status}
		</p>
		<h1 class="mt-2 font-display text-[1.75rem] leading-tight font-semibold text-balance">
			{noExiste ? 'No encontramos esta página' : 'No pudimos cargar esta página'}
		</h1>
		<p class="mt-3 text-light-two_d dark:text-dark-two_d">
			{noExiste
				? 'Puede que el enlace esté incompleto o que la página ya no exista.'
				: (page.error?.message ?? 'Vuelve a intentarlo en unos segundos.')}
		</p>
		<a
			href={resolve('/')}
			class="mt-8 inline-flex h-11 items-center rounded-xl bg-light-three px-5 text-sm font-semibold text-light-one hover:bg-light-three_d focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-three dark:bg-dark-three dark:text-dark-one dark:hover:bg-dark-three_d"
		>
			Ir al inicio
		</a>
	</div>
</main>
