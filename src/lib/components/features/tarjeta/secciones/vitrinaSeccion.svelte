<script lang="ts">
	import { PhotoIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import type {
		TarjetaContactoPublico,
		VitrinaItemPublico,
		VitrinaPublica
	} from '#lib/interfaces/index.ts';
	import { whatsappUrl } from '#lib/utils/contacto.ts';
	import { formatearPrecio, whatsappPrincipal } from '#lib/utils/tarjeta.ts';
	import TarjetaBoton from '../ui/tarjetaBoton.svelte';
	import TarjetaHoja from '../ui/tarjetaHoja.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		vitrina: VitrinaPublica;
		contactos: TarjetaContactoPublico[];
	}

	let { titulo, vitrina, contactos }: Props = $props();

	let categoria = $state<string | null>(null);
	let detalle = $state<VitrinaItemPublico | null>(null);
	let imagenActiva = $state(0);

	// La vitrina pública ya trae solo lo visible, en su orden
	const categorias = $derived(vitrina.categorias);
	const items = $derived(
		categoria ? vitrina.items.filter((i) => i.categoria_id === categoria) : vitrina.items
	);
	const whatsapp = $derived(whatsappPrincipal(contactos));
	const campos = $derived(
		([1, 2, 3, 4] as const)
			.map((n) => ({ clave: `campo${n}` as const, nombre: vitrina[`campo${n}_nombre`] }))
			.filter(
				(campo): campo is { clave: `campo${1 | 2 | 3 | 4}`; nombre: string } => !!campo.nombre
			)
	);

	function consultarUrl(item: VitrinaItemPublico): string | undefined {
		return whatsapp
			? whatsappUrl(whatsapp.valor, `Hola, me interesa "${item.titulo}". ¿Me das más información?`)
			: undefined;
	}

	function abrir(item: VitrinaItemPublico) {
		imagenActiva = 0;
		detalle = item;
	}
</script>

{#snippet precio(item: VitrinaItemPublico, grande = false)}
	{#if vitrina.mostrar_precios && item.precio !== null}
		<span class="flex flex-wrap items-baseline gap-x-2">
			<span class={['font-t-titulos font-bold text-t-precio', grande ? 'text-2xl' : 'text-lg']}>
				{#if item.precio_etiqueta && /^desde$/i.test(item.precio_etiqueta)}<span
						class="text-sm font-semibold"
					>
						Desde
					</span>{/if}
				{formatearPrecio(item.precio, vitrina.moneda)}
			</span>
			{#if item.precio_etiqueta && !/^desde$/i.test(item.precio_etiqueta)}
				<span class="text-sm text-t-texto-sec">{item.precio_etiqueta}</span>
			{/if}
			{#if item.precio_anterior !== null}
				<span class="text-sm text-t-texto-sec line-through">
					<span class="sr-only">Antes </span>{formatearPrecio(item.precio_anterior, vitrina.moneda)}
				</span>
			{/if}
		</span>
	{:else}
		<span class="text-sm font-semibold text-t-texto-sec">Precio a consultar</span>
	{/if}
{/snippet}

<TarjetaSeccion id="vitrina" {titulo}>
	{#if categorias.length > 1}
		<div
			class="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1"
			role="group"
			aria-label="Filtrar por categoría"
		>
			{#each [{ id: null, nombre: 'Todo' }, ...categorias] as opcion (opcion.id ?? 'todo')}
				<button
					type="button"
					aria-pressed={categoria === opcion.id}
					onclick={() => (categoria = opcion.id)}
					class={[
						'h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-t-primario',
						categoria === opcion.id
							? 'bg-t-primario text-t-sobre-primario'
							: 'bg-t-secundario text-t-sobre-secundario'
					]}
				>
					{opcion.nombre}
				</button>
			{/each}
		</div>
	{/if}

	<ul class="space-y-3">
		{#each items as item (item.id)}
			{@const imagen = item.imagenes[0]}
			<li class="rounded-2xl border border-t-borde bg-t-superficie p-3">
				<div class="flex gap-3.5">
					<button
						type="button"
						onclick={() => abrir(item)}
						class="relative size-24 shrink-0 overflow-hidden rounded-xl bg-t-secundario text-t-sobre-secundario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-t-primario"
						aria-label="Ver detalle de {item.titulo}"
					>
						{#if imagen}
							<img
								src={imagen.url}
								alt={imagen.alt ?? ''}
								loading="lazy"
								decoding="async"
								class="size-full object-cover"
							/>
						{:else}
							<PhotoIcon class="mx-auto size-7 opacity-70" />
						{/if}
					</button>
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<h3 class="font-t-titulos text-[1.0625rem] leading-snug font-semibold text-t-titulo">
								{item.titulo}
							</h3>
							{#if item.destacado}
								<span
									class="shrink-0 rounded-full bg-t-destacado px-2 py-0.5 text-[0.6875rem] font-bold text-t-sobre-destacado"
								>
									Destacado
								</span>
							{/if}
						</div>
						{#if item.descripcion}
							<p class="mt-0.5 line-clamp-2 text-sm text-t-texto-sec">{item.descripcion}</p>
						{/if}
						{#if campos.some((campo) => item[campo.clave])}
							<dl class="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-t-texto-sec">
								{#each campos as campo (campo.clave)}
									{#if item[campo.clave]}
										<div class="flex gap-1">
											<dt>{campo.nombre}:</dt>
											<dd class="font-semibold text-t-texto">{item[campo.clave]}</dd>
										</div>
									{/if}
								{/each}
							</dl>
						{/if}
						<div class="mt-2 flex flex-wrap items-center justify-between gap-2">
							{@render precio(item)}
							{#if consultarUrl(item)}
								<TarjetaBoton
									href={consultarUrl(item)}
									externo
									variante="suave"
									size="sm"
									icono={WhatsappIcon}
									aria-label="Consultar por WhatsApp sobre {item.titulo}"
								>
									Consultar
								</TarjetaBoton>
							{/if}
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</TarjetaSeccion>

<TarjetaHoja
	open={detalle !== null}
	titulo={detalle?.titulo ?? ''}
	onClose={() => (detalle = null)}
>
	{#if detalle}
		{#if detalle.imagenes.length > 0}
			<img
				src={detalle.imagenes[imagenActiva]?.url}
				alt={detalle.imagenes[imagenActiva]?.alt ?? ''}
				class="aspect-[4/3] w-full rounded-2xl bg-t-secundario object-cover"
			/>
			{#if detalle.imagenes.length > 1}
				<div class="mt-2 flex gap-2 overflow-x-auto">
					{#each detalle.imagenes as imagen, indice (imagen.id)}
						<button
							type="button"
							onclick={() => (imagenActiva = indice)}
							aria-label="Ver imagen {indice + 1} de {detalle.imagenes.length}"
							aria-pressed={indice === imagenActiva}
							class={[
								'size-16 shrink-0 overflow-hidden rounded-xl border-2',
								indice === imagenActiva ? 'border-t-primario' : 'border-transparent'
							]}
						>
							<img src={imagen.url} alt="" class="size-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		{/if}
		<div class="mt-4">{@render precio(detalle, true)}</div>
		{#if detalle.descripcion}
			<p class="mt-3 leading-relaxed whitespace-pre-line text-t-texto">{detalle.descripcion}</p>
		{/if}
		{#if campos.some((campo) => detalle?.[campo.clave])}
			<dl class="mt-4 grid grid-cols-2 gap-3">
				{#each campos as campo (campo.clave)}
					{#if detalle[campo.clave]}
						<div class="rounded-xl bg-t-superficie px-3 py-2">
							<dt class="text-xs text-t-texto-sec">{campo.nombre}</dt>
							<dd class="font-semibold text-t-titulo">{detalle[campo.clave]}</dd>
						</div>
					{/if}
				{/each}
			</dl>
		{/if}
		{#if consultarUrl(detalle)}
			<TarjetaBoton
				href={consultarUrl(detalle)}
				externo
				fullWidth
				icono={WhatsappIcon}
				class="mt-5"
			>
				Consultar por WhatsApp
			</TarjetaBoton>
		{/if}
	{/if}
</TarjetaHoja>
