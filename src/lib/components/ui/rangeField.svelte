<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min?: number;
		max?: number;
		step?: number;
		/** Unidad que acompaña al valor (%) */
		sufijo?: string;
		hint?: string;
		onchange?: (value: number) => void;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		sufijo = '',
		hint,
		onchange,
		class: className
	}: Props = $props();

	const id = $props.id();
</script>

<div class={className}>
	<div class="mb-1.5 flex items-baseline justify-between gap-3">
		<label for={id} class="text-sm font-medium text-light-two dark:text-dark-two">{label}</label>
		<output for={id} class="text-sm text-light-two_d tabular-nums dark:text-dark-two_d">
			{value}{sufijo}
		</output>
	</div>
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		bind:value
		oninput={() => onchange?.(value)}
		aria-describedby={hint ? `${id}-hint` : undefined}
		class="h-2 w-full cursor-pointer accent-light-three dark:accent-dark-three"
	/>
	{#if hint}
		<p id="{id}-hint" class="mt-1 text-xs text-light-two_d dark:text-dark-two_d">{hint}</p>
	{/if}
</div>
