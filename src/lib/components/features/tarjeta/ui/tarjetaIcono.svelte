<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconoForma } from '#lib/interfaces/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		icono: Component<{ class?: string }>;
		/** `tarjeta_theme.icono_forma` */
		forma: IconoForma;
		/** contacto = color_icono / color_fondo_icono; social = los de redes */
		variante?: 'contacto' | 'social';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		icono: Icono,
		forma,
		variante = 'contacto',
		size = 'md',
		class: className
	}: Props = $props();

	const formas: Record<IconoForma, string> = {
		circulo: 'rounded-full',
		redondeado: 'rounded-2xl',
		cuadrado: 'rounded-[0.3rem]',
		ninguno: 'rounded-full !bg-transparent'
	};

	const tamanos = {
		sm: ['size-10', 'size-5'],
		md: ['size-12', 'size-6'],
		lg: ['size-14', 'size-6']
	} as const;
</script>

<span
	aria-hidden="true"
	class={cn(
		'grid shrink-0 place-items-center',
		variante === 'contacto'
			? 'bg-t-fondo-icono text-t-icono'
			: 'bg-t-fondo-icono-social text-t-icono-social',
		formas[forma],
		tamanos[size][0],
		className
	)}
>
	<Icono class={tamanos[size][1]} />
</span>
