<script lang="ts" module>
	export interface OpcionCombobox {
		valor: string;
		etiqueta: string;
		/** Encabezado bajo el que se agrupa */
		grupo?: string;
		/** Texto secundario a la derecha */
		detalle?: string;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { normalizarTexto } from '#lib/config/rubros.config.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		label: string;
		value: string;
		opciones: OpcionCombobox[];
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		/** Acepta un texto que no está en la lista */
		permitirLibre?: boolean;
		/** Máximo de opciones visibles */
		limite?: number;
		onseleccionar?: (valor: string, opcion: OpcionCombobox | null) => void;
		id?: string;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		opciones,
		placeholder,
		hint,
		error,
		required = false,
		permitirLibre = true,
		limite = 60,
		onseleccionar,
		id: idPropio,
		class: className
	}: Props = $props();

	const idAuto = $props.id();
	const id = $derived(idPropio ?? idAuto);
	const listaId = $derived(`${id}-lista`);

	let texto = $state(untrack(() => value ?? ''));
	let abierto = $state(false);
	let activo = $state(-1);
	let lista = $state<HTMLUListElement>();

	// El valor puede cambiar desde afuera (p. ej. al cargar la tarjeta)
	$effect.pre(() => {
		const actual = value ?? '';
		untrack(() => {
			if (!abierto && texto !== actual) texto = actual;
		});
	});

	const filtradas = $derived.by(() => {
		const buscado = normalizarTexto(texto);
		const coinciden = buscado
			? opciones.filter((opcion) => normalizarTexto(opcion.etiqueta).includes(buscado))
			: opciones;
		return [...coinciden]
			.sort((a, b) => {
				if (!buscado) return 0;
				const aEmpieza = normalizarTexto(a.etiqueta).startsWith(buscado) ? 0 : 1;
				const bEmpieza = normalizarTexto(b.etiqueta).startsWith(buscado) ? 0 : 1;
				return aEmpieza - bEmpieza;
			})
			.slice(0, limite);
	});

	const grupos = $derived.by(() => {
		const resultado: {
			nombre: string | undefined;
			opciones: { opcion: OpcionCombobox; indice: number }[];
		}[] = [];
		filtradas.forEach((opcion, indice) => {
			const ultimo = resultado[resultado.length - 1];
			if (ultimo && ultimo.nombre === opcion.grupo) ultimo.opciones.push({ opcion, indice });
			else resultado.push({ nombre: opcion.grupo, opciones: [{ opcion, indice }] });
		});
		return resultado;
	});

	const expandido = $derived(abierto && filtradas.length > 0);

	function seleccionar(opcion: OpcionCombobox) {
		texto = opcion.etiqueta;
		value = opcion.valor;
		abierto = false;
		activo = -1;
		onseleccionar?.(opcion.valor, opcion);
	}

	function alEscribir(event: Event & { currentTarget: HTMLInputElement }) {
		texto = event.currentTarget.value;
		abierto = true;
		activo = -1;
		if (permitirLibre) {
			value = texto;
			onseleccionar?.(texto, null);
		}
	}

	function mover(paso: number) {
		abierto = true;
		if (filtradas.length === 0) return;
		activo = (activo + paso + filtradas.length) % filtradas.length;
		queueMicrotask(() =>
			lista
				?.querySelector(`#${CSS.escape(`${id}-op-${activo}`)}`)
				?.scrollIntoView({ block: 'nearest' })
		);
	}

	function alTeclear(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			mover(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			mover(-1);
		} else if (event.key === 'Enter' && expandido && activo >= 0) {
			event.preventDefault();
			seleccionar(filtradas[activo]);
		} else if (event.key === 'Escape' && abierto) {
			event.preventDefault();
			abierto = false;
		}
	}

	function alSalir() {
		abierto = false;
		if (!permitirLibre && texto !== value) texto = value ?? '';
	}

	const describedBy = $derived(
		[hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

<div class={cn('relative', className)}>
	<label for={id} class="mb-1.5 block text-sm font-medium text-light-two dark:text-dark-two">
		{label}
		{#if required}<span class="text-light-accent_d dark:text-dark-accent" aria-hidden="true">
				*
			</span>{/if}
	</label>
	<input
		{id}
		type="text"
		role="combobox"
		aria-expanded={expandido}
		aria-controls={listaId}
		aria-autocomplete="list"
		aria-activedescendant={expandido && activo >= 0 ? `${id}-op-${activo}` : undefined}
		aria-invalid={error ? true : undefined}
		aria-describedby={describedBy}
		autocomplete="off"
		{placeholder}
		{required}
		value={texto}
		oninput={alEscribir}
		onkeydown={alTeclear}
		onfocus={() => (abierto = true)}
		onblur={alSalir}
		class={[
			'block h-11 w-full rounded-xl border bg-light-one px-3.5 text-[0.9375rem] text-light-two outline-none placeholder:text-light-four_d focus:ring-2 dark:bg-dark-one dark:text-dark-two dark:placeholder:text-dark-four_d',
			error
				? 'border-light-error focus:ring-light-error/20 dark:border-dark-error'
				: 'border-light-four hover:border-light-four_d focus:border-light-three focus:ring-light-three/15 dark:border-dark-four dark:focus:border-dark-three dark:focus:ring-dark-three/25'
		]}
	/>
	<ul
		bind:this={lista}
		id={listaId}
		role="listbox"
		aria-label={label}
		hidden={!expandido}
		class="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto overscroll-contain rounded-xl border border-light-four/40 bg-light-one p-1 shadow-xl dark:border-dark-one_d dark:bg-dark-one"
	>
		{#each grupos as grupo, g (g)}
			{#if grupo.nombre}
				<li
					role="presentation"
					class="px-2.5 pt-2.5 pb-1 text-xs font-semibold text-light-four_d dark:text-dark-four_d"
				>
					{grupo.nombre}
				</li>
			{/if}
			{#each grupo.opciones as { opcion, indice } (opcion.valor)}
				<li
					id="{id}-op-{indice}"
					role="option"
					aria-selected={indice === activo}
					onmousedown={(event) => {
						event.preventDefault();
						seleccionar(opcion);
					}}
					onmousemove={() => (activo = indice)}
					class="flex cursor-pointer items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-sm text-light-two aria-selected:bg-light-one_d dark:text-dark-two dark:aria-selected:bg-dark-one_d"
				>
					<span>{opcion.etiqueta}</span>
					{#if opcion.detalle}
						<span class="shrink-0 text-xs text-light-two_d dark:text-dark-two_d">
							{opcion.detalle}
						</span>
					{/if}
				</li>
			{/each}
		{/each}
	</ul>
	{#if hint && !error}
		<p id="{id}-hint" class="mt-1.5 text-xs text-light-two_d dark:text-dark-two_d">{hint}</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="mt-1.5 text-xs font-medium text-light-error dark:text-dark-error">
			{error}
		</p>
	{/if}
</div>
