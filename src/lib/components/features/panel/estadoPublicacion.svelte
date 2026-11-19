<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		publicada: boolean;
		class?: string;
	}

	let { publicada, class: className }: Props = $props();
</script>

<span
	class={cn(
		'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
		publicada
			? 'bg-light-success/10 text-[color-mix(in_oklab,var(--color-light-success)_62%,black)] dark:bg-dark-success/12 dark:text-dark-success'
			: 'bg-light-one_d text-light-two_d dark:bg-dark-one_d dark:text-dark-two_d',
		className
	)}
>
	<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
	{publicada ? 'Publicada' : 'Borrador'}
</span>
