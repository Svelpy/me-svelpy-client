<!--
	Visual del hero: teléfono con perfiles reales de ejemplo que rotan solos (salvo con movimiento
	reducido), selector por rubro y tarjeta física con QR. La rotación se detiene al elegir un perfil
	o con el botón de pausa (WCAG 2.2.2).
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';
	import { CapsuleTabs, PhoneFrame } from '../ui/index.ts';
	import type { PerfilEjemplo } from '../landing.content.ts';
	import PhysicalCard from './physicalCard.svelte';

	interface Props {
		perfiles: PerfilEjemplo[];
		/** Milisegundos entre perfiles. */
		intervalo?: number;
		class?: string;
	}

	let { perfiles, intervalo = 4500, class: className = '' }: Props = $props();

	const items = $derived(perfiles.map((p) => ({ id: p.slug, label: p.rubro })));
	let activo = $state(untrack(() => perfiles[0]?.slug ?? ''));
	let pausado = $state(false);
	let encima = $state(false);
	const perfilActivo = $derived(perfiles.find((p) => p.slug === activo) ?? perfiles[0]);

	$effect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) pausado = true;
	});

	$effect(() => {
		if (pausado || encima || perfiles.length < 2) return;
		const timer = setInterval(() => {
			const i = perfiles.findIndex((p) => p.slug === activo);
			activo = perfiles[(i + 1) % perfiles.length].slug;
		}, intervalo);
		return () => clearInterval(timer);
	});
</script>

<div
	class={cn('relative', className)}
	role="group"
	aria-label="Perfiles de ejemplo"
	onpointerenter={() => (encima = true)}
	onpointerleave={() => (encima = false)}
	onfocusin={() => (encima = true)}
	onfocusout={() => (encima = false)}
>
	<CapsuleTabs
		{items}
		bind:value={activo}
		label="Elige un perfil de ejemplo"
		idPrefix="hero-perfil"
		tone="dark"
		class="flex flex-col-reverse items-center gap-7"
		onselect={() => (pausado = true)}
	>
		{#snippet trailing()}
			<button
				type="button"
				onclick={() => (pausado = !pausado)}
				aria-label={pausado ? 'Reanudar la rotación de perfiles' : 'Pausar la rotación de perfiles'}
				class="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-primary-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
			>
				{#if pausado}
					<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
						<path
							d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
						<rect x="6" y="4" width="4" height="16" rx="2" /><rect
							x="14"
							y="4"
							width="4"
							height="16"
							rx="2"
						/>
					</svg>
				{/if}
			</button>
		{/snippet}

		{#snippet panel(item)}
			<div class="relative flex justify-center sm:pl-16">
				<PhoneFrame slug={item.id} class="w-[272px] sm:w-[300px]">
					{#each perfiles as perfil, i (perfil.slug)}
						{@const visible = perfil.slug === item.id}
						<div
							class={cn(
								'absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none',
								visible ? 'opacity-100' : 'opacity-0'
							)}
							aria-hidden={!visible}
						>
							<enhanced:img
								src={perfil.imagen}
								alt={perfil.alt}
								sizes="300px"
								loading={i === 0 ? 'eager' : 'lazy'}
								fetchpriority={i === 0 ? 'high' : 'auto'}
								class="h-auto w-full"
							/>
						</div>
					{/each}
				</PhoneFrame>

				{#if perfilActivo}
					<PhysicalCard
						nombre={perfilActivo.nombre}
						cargo={perfilActivo.cargo}
						slug={perfilActivo.slug}
						class="absolute bottom-10 -left-2 hidden -rotate-[7deg] sm:flex lg:-left-10"
					/>
				{/if}
			</div>
		{/snippet}
	</CapsuleTabs>
</div>
