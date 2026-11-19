<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		checked?: boolean;
		/** Texto visible; con `etiquetaOculta` solo lo leen los lectores de pantalla */
		label: string;
		/** Explicación bajo la etiqueta */
		descripcion?: string;
		etiquetaOculta?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label,
		descripcion,
		etiquetaOculta = false,
		disabled = false,
		onchange,
		class: className
	}: Props = $props();

	const id = $props.id();

	function alternar() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

<div
	class={cn(
		'flex items-start gap-3',
		etiquetaOculta ? 'inline-flex' : 'justify-between',
		className
	)}
>
	{#if !etiquetaOculta}
		<div class="min-w-0">
			<span id="{id}-label" class="block text-sm font-medium text-light-two dark:text-dark-two">
				{label}
			</span>
			{#if descripcion}
				<span id="{id}-desc" class="mt-0.5 block text-xs text-light-two_d dark:text-dark-two_d">
					{descripcion}
				</span>
			{/if}
		</div>
	{/if}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-labelledby={etiquetaOculta ? undefined : `${id}-label`}
		aria-label={etiquetaOculta ? label : undefined}
		aria-describedby={descripcion && !etiquetaOculta ? `${id}-desc` : undefined}
		{disabled}
		onclick={alternar}
		class={[
			'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-three disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-dark-three',
			checked
				? 'border-light-three bg-light-three dark:border-dark-three dark:bg-dark-three'
				: 'border-light-four bg-light-one_d dark:border-dark-four dark:bg-dark-one_d'
		]}
	>
		<span
			aria-hidden="true"
			class={[
				'inline-block size-4.5 rounded-full shadow-sm transition-transform duration-150 motion-reduce:transition-none',
				checked
					? 'translate-x-[1.375rem] bg-light-one dark:bg-dark-one'
					: 'translate-x-[0.1875rem] bg-light-four_d dark:bg-dark-four_d'
			]}
		></span>
	</button>
</div>
