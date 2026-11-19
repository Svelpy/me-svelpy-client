<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';
	import { iniciales } from '#lib/utils/tarjeta.ts';

	type Tamano = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		src?: string | null;
		/** Para las iniciales cuando no hay foto */
		nombre: string;
		/** Texto alternativo; vacío si el nombre ya está escrito al lado */
		alt?: string;
		size?: Tamano;
		class?: string;
	}

	let { src, nombre, alt = '', size = 'md', class: className }: Props = $props();

	let fallo = $state(false);
	$effect(() => {
		void src;
		fallo = false;
	});

	const tamanos: Record<Tamano, string> = {
		sm: 'size-8 text-xs',
		md: 'size-10 text-sm',
		lg: 'size-14 text-base',
		xl: 'size-20 text-xl'
	};
</script>

{#if src && !fallo}
	<img
		{src}
		{alt}
		loading="lazy"
		decoding="async"
		onerror={() => (fallo = true)}
		class={cn('shrink-0 rounded-full object-cover', tamanos[size], className)}
	/>
{:else}
	<span
		role={alt ? 'img' : undefined}
		aria-label={alt || undefined}
		aria-hidden={alt ? undefined : 'true'}
		class={cn(
			'grid shrink-0 place-items-center rounded-full bg-light-one_d font-display font-semibold text-light-two dark:bg-dark-one_d dark:text-dark-two',
			tamanos[size],
			className
		)}
	>
		{iniciales(nombre)}
	</span>
{/if}
