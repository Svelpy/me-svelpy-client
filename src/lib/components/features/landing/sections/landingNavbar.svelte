<script lang="ts">
	import { resolve } from '$app/paths';
	import { Menu2Icon, WhatsappIcon, XMarkIcon } from '#lib/icons/outline/index.ts';
	import { LandingButton } from '../ui/index.ts';
	import { CTA_CREAR, CTA_SOLICITAR, LANDING_LINKS, LOGOS, NAV_LINKS } from '../landing.content.ts';

	let abierto = $state(false);

	function cerrar() {
		abierto = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && abierto) cerrar();
	}
</script>

<svelte:window {onkeydown} />

<header
	class="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-primary-950/90 backdrop-blur-md"
>
	<nav
		aria-label="Principal"
		class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8"
	>
		<a
			href={resolve('/')}
			class="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
		>
			<img src={LOGOS.isotipoOscuro} alt="ME" class="h-7 w-auto" width="48" height="28" />
		</a>

		<ul class="mx-auto hidden items-center gap-1 lg:flex">
			{#each NAV_LINKS as link (link.href)}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- ancla de la misma página: no es una ruta de la app -->
					<a
						href={link.href}
						class="inline-flex h-10 items-center rounded-full px-3.5 text-sm text-primary-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						{link.label}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>

		<div class="ml-auto flex items-center gap-1.5 lg:ml-0">
			<LandingButton
				href={LANDING_LINKS.iniciarSesion}
				variant="ghost"
				tone="dark"
				size="sm"
				class="hidden sm:inline-flex"
			>
				Iniciar sesión
			</LandingButton>
			<LandingButton href={LANDING_LINKS.registro} tone="dark" size="sm">
				{CTA_CREAR}
			</LandingButton>
			<button
				type="button"
				class="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
				aria-expanded={abierto}
				aria-controls="menu-movil"
				aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
				onclick={() => (abierto = !abierto)}
			>
				{#if abierto}
					<XMarkIcon class="size-5" />
				{:else}
					<Menu2Icon class="size-5" />
				{/if}
			</button>
		</div>
	</nav>

	{#if abierto}
		<div id="menu-movil" class="border-t border-white/10 bg-primary-950 px-4 pt-2 pb-6 lg:hidden">
			<ul class="flex flex-col">
				{#each NAV_LINKS as link (link.href)}
					<li>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- ancla de la misma página: no es una ruta de la app -->
						<a
							href={link.href}
							onclick={cerrar}
							class="flex h-12 items-center rounded-xl px-2 font-display text-lg font-medium text-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white"
						>
							{link.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ul>
			<div class="mt-4 flex flex-col gap-2.5">
				<LandingButton
					href={LANDING_LINKS.iniciarSesion}
					variant="secondary"
					tone="dark"
					class="w-full sm:hidden"
				>
					Iniciar sesión
				</LandingButton>
				<LandingButton
					href={LANDING_LINKS.solicitarMe}
					external
					variant="secondary"
					tone="dark"
					class="w-full"
				>
					<WhatsappIcon class="size-5 shrink-0" />
					{CTA_SOLICITAR}
				</LandingButton>
			</div>
		</div>
	{/if}
</header>
