<!--
	El enlace de una tarjeta: el dominio va pegado dentro del campo (me.svelpy.com/…) para que se lea
	como lo que es, lo escrito se convierte en enlace al vuelo y se revisa en vivo si está libre.
	Si está tomado, ofrece una alternativa con un clic.
-->
<script lang="ts" module>
	export type EstadoEnlace = 'vacio' | 'revisando' | 'libre' | 'ocupado' | 'invalido' | 'actual';
</script>

<script lang="ts">
	import { CircleCheckIcon, LoaderIcon, XIcon } from '#lib/icons/outline/index.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { limpiarSlugEscrito } from '#lib/utils/slug.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';

	interface Props {
		value: string;
		label?: string;
		/** Ayuda mientras no hay nada que avisar */
		hint?: string;
		error?: string;
		required?: boolean;
		/** Sin sesión (registro): revisa con el endpoint público */
		publico?: boolean;
		/** La tarjeta que se edita: su propio enlace cuenta como libre */
		excluirId?: string;
		/** El enlace que ya tiene (no se revisa) */
		actual?: string;
		size?: 'md' | 'lg';
		/** Estado de la revisión, para que el formulario sepa si puede seguir */
		estado?: EstadoEnlace;
		/** La persona escribió en el campo (deja de sugerirse desde el nombre) */
		oneditar?: () => void;
		id?: string;
		class?: string;
	}

	let {
		value = $bindable(),
		label = 'Enlace de la tarjeta',
		hint,
		error,
		required = false,
		publico = false,
		excluirId,
		actual,
		size = 'md',
		estado = $bindable('vacio'),
		oneditar,
		id: idPropio,
		class: className
	}: Props = $props();

	const idAuto = $props.id();
	const id = $derived(idPropio ?? idAuto);

	let motivo = $state('');
	let sugerencia = $state<string | null>(null);
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	function alEscribir(event: Event & { currentTarget: HTMLInputElement }) {
		const limpio = limpiarSlugEscrito(event.currentTarget.value);
		if (event.currentTarget.value !== limpio) event.currentTarget.value = limpio;
		value = limpio;
		oneditar?.();
	}

	// Revisa cada valor nuevo, con una pausa para no consultar en cada tecla
	$effect(() => {
		const slug = value;
		clearTimeout(temporizador);
		motivo = '';
		sugerencia = null;
		if (!slug) {
			estado = 'vacio';
			return;
		}
		if (actual && slug === actual) {
			estado = 'actual';
			return;
		}
		// A medio escribir ("rocio-") todavía no hay nada que revisar
		if (slug.length < 3 || slug.endsWith('-')) {
			estado = 'vacio';
			return;
		}
		estado = 'revisando';
		temporizador = setTimeout(async () => {
			try {
				const respuesta = publico
					? await tarjetaService.slugDisponiblePublico(slug)
					: await tarjetaService.slugDisponible(slug, excluirId);
				if (slug !== value) return;
				if (respuesta.disponible) {
					estado = 'libre';
				} else {
					estado = respuesta.sugerencia ? 'ocupado' : 'invalido';
					motivo = respuesta.motivo ?? 'No está disponible.';
					sugerencia = respuesta.sugerencia;
				}
			} catch {
				// Sin red no se bloquea: el backend lo vuelve a revisar al guardar
				if (slug === value) estado = 'vacio';
			}
		}, 350);
		return () => clearTimeout(temporizador);
	});

	function usarSugerencia() {
		if (!sugerencia) return;
		value = sugerencia;
		oneditar?.();
	}

	const malo = $derived(!!error || estado === 'ocupado' || estado === 'invalido');
	const mensajeId = $derived(`${id}-mensaje`);
	const prefijoId = $derived(`${id}-prefijo`);

	const sizes = {
		md: { caja: 'h-11', texto: 'text-[0.9375rem]' },
		lg: { caja: 'h-12', texto: 'text-base' }
	};
</script>

<div class={className}>
	<label for={id} class="mb-1.5 block text-sm font-medium text-light-two dark:text-dark-two">
		{label}
		{#if required}<span class="text-light-accent_d dark:text-dark-accent" aria-hidden="true">
				*
			</span>{/if}
	</label>
	<div
		class={cn(
			'flex items-center rounded-xl border bg-light-one transition-[border-color,box-shadow] focus-within:ring-2 dark:bg-dark-one',
			sizes[size].caja,
			malo
				? 'border-light-error focus-within:ring-light-error/20 dark:border-dark-error'
				: 'border-light-four focus-within:border-light-three focus-within:ring-light-three/15 hover:border-light-four_d dark:border-dark-four dark:focus-within:border-dark-three dark:focus-within:ring-dark-three/25'
		)}
	>
		<!-- El dominio es parte del enlace: se lee junto con lo escrito, pero no se edita. El input no
			lleva borde ni anillo propios: el marco es esta caja -->
		<span
			id={prefijoId}
			class={cn(
				'shrink-0 cursor-text pl-3.5 font-mono text-light-two_d select-none dark:text-dark-two_d',
				sizes[size].texto
			)}
		>
			{DOMINIO_PUBLICO}/
		</span>
		<input
			{id}
			type="text"
			inputmode="url"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			maxlength={80}
			placeholder="tu-nombre"
			{required}
			{value}
			oninput={alEscribir}
			aria-invalid={malo || undefined}
			aria-describedby="{prefijoId} {mensajeId}"
			class={cn(
				'h-full min-w-0 flex-1 border-0 bg-transparent px-0 pr-2 font-mono text-light-two shadow-none outline-none placeholder:text-light-four_d focus:border-0 focus:ring-0 focus:outline-none dark:text-dark-two dark:placeholder:text-dark-four_d',
				sizes[size].texto
			)}
		/>
		<span class="grid w-10 shrink-0 place-items-center" aria-hidden="true">
			{#if estado === 'revisando'}
				<LoaderIcon class="size-5 animate-spin text-light-four_d dark:text-dark-four_d" />
			{:else if estado === 'libre'}
				<CircleCheckIcon class="size-5 text-light-success dark:text-dark-success" />
			{:else if malo}
				<XIcon class="size-5 text-light-error dark:text-dark-error" />
			{/if}
		</span>
	</div>

	<div id={mensajeId} aria-live="polite" class="mt-1.5 text-xs">
		{#if error}
			<p class="font-medium text-light-error dark:text-dark-error">{error}</p>
		{:else if estado === 'libre'}
			<p class="font-medium text-light-success dark:text-dark-success">
				Está libre: {DOMINIO_PUBLICO}/{value}
			</p>
		{:else if estado === 'ocupado' || estado === 'invalido'}
			<p class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<span class="font-medium text-light-error dark:text-dark-error">{motivo}</span>
				{#if sugerencia}
					<button
						type="button"
						onclick={usarSugerencia}
						class="rounded font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two dark:decoration-dark-four dark:focus-visible:outline-dark-three"
					>
						Usar {sugerencia}
					</button>
				{/if}
			</p>
		{:else if hint}
			<p class="text-light-two_d dark:text-dark-two_d">{hint}</p>
		{/if}
	</div>
</div>
