<!--
	Botón/enlace con forma de cápsula, exclusivo de la landing (usa la paleta ciruela/naranja).
	Si recibe `href` se renderiza como <a>; si no, como <button>.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils/cn.ts';

	type Variant = 'primary' | 'secondary' | 'ghost';
	type Tone = 'light' | 'dark';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		/** Fondo sobre el que se dibuja el botón: cambia los colores de `secondary` y `ghost`. */
		tone?: Tone;
		size?: Size;
		href?: string;
		/** Abre en otra pestaña con `rel="noopener noreferrer"` (WhatsApp, sitios externos). */
		external?: boolean;
		class?: string;
		children: Snippet;
	} & Omit<HTMLAnchorAttributes & HTMLButtonAttributes, 'class' | 'children'>;

	let {
		variant = 'primary',
		tone = 'light',
		size = 'md',
		href,
		external = false,
		class: className = '',
		type = 'button',
		children,
		...rest
	}: Props = $props();

	const base =
		'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-sans font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:opacity-50';

	const sizes: Record<Size, string> = {
		sm: 'h-10 px-4 text-sm',
		md: 'h-12 px-6 text-base',
		lg: 'h-14 px-7 text-[1.0625rem]'
	};

	// Texto ciruela sobre naranja: 5,3:1 (AA). El blanco sobre #FF4724 solo llega a 3,4:1.
	const variants: Record<Variant, Record<Tone, string>> = {
		primary: {
			light:
				'bg-secondary text-primary-950 hover:bg-secondary-400 focus-visible:outline-primary-900',
			dark: 'bg-secondary text-primary-950 hover:bg-secondary-400 focus-visible:outline-white'
		},
		secondary: {
			light:
				'border-2 border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white focus-visible:outline-primary-900',
			dark: 'border-2 border-white/70 text-white hover:border-white hover:bg-white hover:text-primary-950 focus-visible:outline-white'
		},
		ghost: {
			light:
				'text-primary-700 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-primary-900',
			dark: 'text-primary-300 hover:bg-white/10 hover:text-white focus-visible:outline-white'
		}
	};

	const classes = $derived(cn(base, sizes[size], variants[variant][tone], className));
</script>

{#if href}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- href ya resuelto por quien llama (anclas, externos o resolve()) -->
	<a
		{href}
		class={classes}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render children()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button {type} class={classes} {...rest as HTMLButtonAttributes}>
		{@render children()}
	</button>
{/if}
