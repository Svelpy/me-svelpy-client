<script lang="ts">
	import { DeviceDesktopIcon, MoonIcon, SunIcon } from '#lib/icons/outline/index.ts';
	import { modoColor, type ModoColor } from '#lib/stores/temaUi.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** Sobre el sidebar ciruela (colores invertidos) */
		sobreOscuro?: boolean;
		class?: string;
	}

	let { sobreOscuro = false, class: className }: Props = $props();

	const opciones: { value: ModoColor; label: string; icon: typeof SunIcon }[] = [
		{ value: 'claro', label: 'Modo claro', icon: SunIcon },
		{ value: 'oscuro', label: 'Modo oscuro', icon: MoonIcon },
		{ value: 'sistema', label: 'Como el sistema', icon: DeviceDesktopIcon }
	];

	let botones = $state<HTMLButtonElement[]>([]);

	// Patrón radiogroup: las flechas mueven la selección y el foco
	function alTeclear(event: KeyboardEvent, indice: number) {
		const paso =
			event.key === 'ArrowRight' || event.key === 'ArrowDown'
				? 1
				: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
					? -1
					: 0;
		if (!paso) return;
		event.preventDefault();
		const siguiente = (indice + paso + opciones.length) % opciones.length;
		modoColor.set(opciones[siguiente].value);
		botones[siguiente]?.focus();
	}
</script>

<div
	role="radiogroup"
	aria-label="Modo de color"
	class={cn(
		'inline-flex items-center gap-0.5 rounded-full p-0.5',
		sobreOscuro ? 'bg-white/10' : 'bg-light-one_d dark:bg-dark-one_d',
		className
	)}
>
	{#each opciones as opcion, indice (opcion.value)}
		{@const activo = $modoColor === opcion.value}
		<button
			bind:this={botones[indice]}
			type="button"
			role="radio"
			aria-checked={activo}
			aria-label={opcion.label}
			title={opcion.label}
			tabindex={activo ? 0 : -1}
			onclick={() => modoColor.set(opcion.value)}
			onkeydown={(event) => alTeclear(event, indice)}
			class={[
				'grid size-7 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-1',
				sobreOscuro
					? activo
						? 'bg-white text-light-three focus-visible:outline-white'
						: 'text-white/65 hover:text-white focus-visible:outline-white'
					: activo
						? 'bg-light-one text-light-two shadow-sm focus-visible:outline-light-three dark:bg-dark-one dark:text-dark-two dark:focus-visible:outline-dark-three'
						: 'text-light-two_d hover:text-light-two focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three'
			]}
		>
			<opcion.icon class="size-4" />
		</button>
	{/each}
</div>
