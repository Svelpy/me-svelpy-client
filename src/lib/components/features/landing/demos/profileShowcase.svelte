<!--
	Visual del hero: teléfono con perfiles de ejemplo que rotan solos, como un carrusel, junto a la
	tarjeta física con QR. La rotación se detiene mientras el puntero o el foco están encima; con
	movimiento reducido los perfiles cambian sin fundido.
-->
<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';
	import { PhoneFrame } from '../ui/index.ts';
	import type { PerfilEjemplo } from '../landing.content.ts';
	import PhysicalCard from './physicalCard.svelte';

	interface Props {
		perfiles: PerfilEjemplo[];
		/** Milisegundos entre perfiles. */
		intervalo?: number;
		class?: string;
	}

	let { perfiles, intervalo = 4500, class: className = '' }: Props = $props();

	let indice = $state(0);
	let encima = $state(false);
	const perfilActivo = $derived(perfiles[indice % perfiles.length]);

	$effect(() => {
		if (encima || perfiles.length < 2) return;
		const timer = setInterval(() => (indice = (indice + 1) % perfiles.length), intervalo);
		return () => clearInterval(timer);
	});
</script>

<div
	class={cn('relative flex justify-center sm:pl-16', className)}
	role="group"
	aria-roledescription="carrusel"
	aria-label="Perfiles de ejemplo"
	onpointerenter={() => (encima = true)}
	onpointerleave={() => (encima = false)}
	onfocusin={() => (encima = true)}
	onfocusout={() => (encima = false)}
>
	{#if perfilActivo}
		<PhoneFrame slug={perfilActivo.slug} class="w-[272px] sm:w-[300px]">
			{#each perfiles as perfil, i (perfil.slug)}
				{@const visible = perfil.slug === perfilActivo.slug}
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

		<PhysicalCard
			nombre={perfilActivo.nombre}
			cargo={perfilActivo.cargo}
			slug={perfilActivo.slug}
			class="absolute bottom-10 -left-2 hidden -rotate-[7deg] sm:flex lg:-left-10"
		/>
	{/if}
</div>
