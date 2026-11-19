<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		interactive?: boolean;
		disabled?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		variant = 'default',
		size = 'md',
		interactive = false,
		disabled = false,
		padding = 'md',
		header,
		footer,
		children,
		class: additionalClass = '',
		onclick,
		...restProps
	}: CardProps = $props();

	// Clases base estáticas
	const baseClasses = 'rounded-2xl transition-colors duration-150';

	// Diccionarios de estilos (estos pueden ser const porque no cambian)
	const variantStyles = {
		default: 'border border-light-four/40 bg-light-one dark:border-dark-one_d dark:bg-dark-one',
		bordered: 'border border-light-four bg-light-one dark:border-dark-four dark:bg-dark-one',
		elevated: 'bg-light-one shadow-lg dark:bg-dark-one_d',
		ghost: 'border-0 bg-transparent shadow-none'
	};

	const sizeStyles = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg xl:max-w-xl'
	};

	const paddingStyles = {
		none: '',
		sm: 'p-3',
		md: 'p-4 sm:p-6',
		lg: 'p-6 sm:p-8'
	};

	// --- CÁLCULOS REACTIVOS CON $derived ---

	const interactiveClasses = $derived(
		interactive && !disabled
			? 'cursor-pointer hover:bg-light-one_d focus-visible:outline-2 focus-visible:outline-light-three dark:hover:bg-dark-one_d dark:focus-visible:outline-dark-three'
			: ''
	);

	const disabledClasses = $derived(
		disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
	);

	// Combinamos todas las clases reactivamente
	const cardClasses = $derived(
		[
			baseClasses,
			variantStyles[variant],
			sizeStyles[size],
			paddingStyles[padding],
			interactiveClasses,
			disabledClasses,
			additionalClass
		]
			.filter(Boolean)
			.join(' ')
	);

	// Handler para clicks
	const handleClick = (event: MouseEvent | KeyboardEvent) => {
		if (disabled) return;
		onclick?.(event as any);
	};
</script>

<div
	class={cardClasses}
	{...interactive && {
		role: 'button',
		tabindex: disabled ? -1 : 0,
		'aria-disabled': disabled || undefined
	}}
	onclick={handleClick}
	onkeydown={(e) => {
		if (interactive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			handleClick(e);
		}
	}}
	{...restProps}
>
	{#if header}
		<div class="card-header mb-4 border-b border-light-four/40 pb-4 dark:border-dark-one_d">
			{@render header()}
		</div>
	{/if}

	<div class="card-content">
		{@render children()}
	</div>

	{#if footer}
		<div class="card-footer mt-4 border-t border-light-four/40 pt-4 dark:border-dark-one_d">
			{@render footer()}
		</div>
	{/if}
</div>
