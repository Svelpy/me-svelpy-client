<script lang="ts">
	import { LoaderIcon } from '#lib/icons/outline/index.ts';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils/cn.ts';

	type ButtonVariant =
		'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'destructive' | 'link' | 'danger';
	type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		children?: Snippet;
		/**
		 * primary = tinta (acciones normales); accent = naranja, solo para LA acción principal de la
		 * pantalla; secondary/outline = con borde; ghost = sin fondo; destructive = eliminar.
		 */
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
		class?: string;
		href?: string;
		target?: HTMLAnchorAttributes['target'];
		rel?: HTMLAnchorAttributes['rel'];
		type?: HTMLButtonAttributes['type'];
		onclick?: (event: MouseEvent) => void;
		[key: string]: unknown;
	}

	let {
		children,
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		leftIcon,
		rightIcon,
		class: className = '',
		href,
		target,
		rel,
		type = 'button',
		onclick,
		...restProps
	}: Props = $props();

	const base =
		'relative inline-flex items-center justify-center font-semibold whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-three active:scale-[0.98] motion-reduce:transform-none touch-manipulation aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:focus-visible:outline-dark-three';

	const destructivo =
		'bg-light-error text-white hover:bg-[color-mix(in_oklab,var(--color-light-error)_86%,black)] dark:bg-dark-error dark:text-dark-one dark:hover:bg-[color-mix(in_oklab,var(--color-dark-error)_88%,white)]';

	const variants: Record<ButtonVariant, string> = {
		primary:
			'bg-light-three text-light-one hover:bg-light-three_d dark:bg-dark-three dark:text-dark-one dark:hover:bg-dark-three_d',
		accent:
			'bg-light-accent text-light-black hover:bg-[color-mix(in_oklab,var(--color-light-accent)_82%,white)] dark:bg-dark-accent dark:text-dark-one dark:hover:bg-dark-accent_d',
		secondary:
			'border border-light-four bg-light-one text-light-two hover:bg-light-one_d dark:border-dark-four dark:bg-dark-one dark:text-dark-two dark:hover:bg-dark-one_d',
		outline:
			'border border-light-four text-light-two hover:bg-light-one_d dark:border-dark-four dark:text-dark-two dark:hover:bg-dark-one_d',
		ghost: 'text-light-two hover:bg-light-one_d dark:text-dark-two dark:hover:bg-dark-one_d',
		destructive: destructivo,
		danger: destructivo,
		link: 'text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two'
	};

	const sizes: Record<ButtonSize, string> = {
		xs: 'h-8 gap-1.5 rounded-lg px-2.5 text-xs',
		sm: 'h-9 gap-2 rounded-xl px-3 text-sm',
		md: 'h-11 gap-2 rounded-xl px-4 text-sm',
		lg: 'h-12 gap-2.5 rounded-xl px-5 text-base',
		xl: 'h-14 gap-3 rounded-2xl px-6 text-base'
	};

	const iconSizes: Record<ButtonSize, string> = {
		xs: 'size-8 rounded-lg',
		sm: 'size-9 rounded-xl',
		md: 'size-11 rounded-xl',
		lg: 'size-12 rounded-xl',
		xl: 'size-14 rounded-2xl'
	};

	const isDisabled = $derived(disabled || loading);
	const isIconOnly = $derived(!children && (!!leftIcon || !!rightIcon));

	$effect(() => {
		if (isIconOnly && !restProps['aria-label']) {
			console.warn('Un botón solo con ícono necesita `aria-label` para los lectores de pantalla.');
		}
	});

	const buttonClasses = $derived(
		cn(
			base,
			variants[variant],
			variant === 'link' ? 'h-auto px-0' : isIconOnly ? iconSizes[size] : sizes[size],
			fullWidth && 'w-full',
			className
		)
	);

	function handleClick(event: MouseEvent) {
		if (isDisabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}
</script>

{#if href}
	<a
		{...restProps}
		href={isDisabled ? undefined : href}
		{target}
		{rel}
		class={buttonClasses}
		aria-disabled={isDisabled || undefined}
		aria-busy={loading || undefined}
		onclick={handleClick}
	>
		{@render buttonContent()}
	</a>
{:else}
	<button
		{...restProps}
		{type}
		class={buttonClasses}
		aria-disabled={isDisabled || undefined}
		aria-busy={loading || undefined}
		onclick={handleClick}
	>
		{@render buttonContent()}
	</button>
{/if}

{#snippet buttonContent()}
	{#if loading}
		<span class="absolute inset-0 flex items-center justify-center">
			<LoaderIcon class="size-5 animate-spin motion-reduce:animate-none" />
			<span class="sr-only">Procesando</span>
		</span>
	{/if}
	{#if leftIcon}
		<span aria-hidden="true" class={['inline-flex', loading && 'invisible']}>
			{@render leftIcon()}
		</span>
	{/if}
	{#if children}
		<span class={loading ? 'invisible' : ''}>{@render children()}</span>
	{/if}
	{#if rightIcon}
		<span aria-hidden="true" class={['inline-flex', loading && 'invisible']}>
			{@render rightIcon()}
		</span>
	{/if}
{/snippet}
