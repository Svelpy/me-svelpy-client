<script lang="ts">
	import { ThemeToggle } from '#lib/components/ui/index.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div
	data-area="app"
	class="relative min-h-dvh bg-light-one font-sans text-light-two dark:bg-dark-one dark:text-dark-two"
>
	<div class="absolute top-4 right-4 z-10">
		<ThemeToggle />
	</div>
	{@render children()}
</div>
