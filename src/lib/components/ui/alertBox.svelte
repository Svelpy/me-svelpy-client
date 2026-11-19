<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		AlertCircleIcon,
		AlertTriangleIcon,
		CircleCheckIcon,
		InfoCircleIcon
	} from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	type Variant = 'info' | 'success' | 'warning' | 'error';

	interface Props {
		variant?: Variant;
		/** Resumen en una línea; el detalle va en children */
		title?: string;
		children?: Snippet;
		/** Acción a la derecha (p. ej. "Reintentar") */
		accion?: Snippet;
		class?: string;
	}

	let { variant = 'info', title, children, accion, class: className }: Props = $props();

	const estilos: Record<Variant, string> = {
		info: 'border-light-four/50 bg-light-one_d text-light-two dark:border-dark-one_d dark:bg-dark-one_d dark:text-dark-two',
		success:
			'border-light-success/30 bg-light-success/8 text-[color-mix(in_oklab,var(--color-light-success)_62%,black)] dark:border-dark-success/30 dark:bg-dark-success/10 dark:text-dark-success',
		warning:
			'border-light-warning/45 bg-light-warning/10 text-[color-mix(in_oklab,var(--color-light-warning)_50%,black)] dark:border-dark-warning/35 dark:bg-dark-warning/10 dark:text-dark-warning',
		error:
			'border-light-error/30 bg-light-error/7 text-[color-mix(in_oklab,var(--color-light-error)_82%,black)] dark:border-dark-error/35 dark:bg-dark-error/10 dark:text-dark-error'
	};

	const iconos = {
		info: InfoCircleIcon,
		success: CircleCheckIcon,
		warning: AlertTriangleIcon,
		error: AlertCircleIcon
	};

	const Icono = $derived(iconos[variant]);
	// Los errores y advertencias se anuncian al aparecer; lo informativo, sin interrumpir
	const role = $derived(variant === 'error' || variant === 'warning' ? 'alert' : 'status');
</script>

<div
	{role}
	class={cn(
		'flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm',
		estilos[variant],
		className
	)}
>
	<Icono class="mt-px size-5 shrink-0" />
	<div class="min-w-0 flex-1 leading-relaxed">
		{#if title}<p class="font-semibold">{title}</p>{/if}
		{#if children}<div class={title ? 'mt-0.5 opacity-90' : ''}>{@render children()}</div>{/if}
	</div>
	{#if accion}<div class="shrink-0">{@render accion()}</div>{/if}
</div>
