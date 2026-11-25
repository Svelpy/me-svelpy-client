<script lang="ts">
	import { ClockIcon, NavigationIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaUbicacionPublica } from '#lib/interfaces/index.ts';
	import { comoLlegarUrl, mapsUrl } from '#lib/utils/contacto.ts';
	import { diaSemanaDe, estadoApertura, resumenSemanal } from '#lib/utils/horarios.ts';
	import MapaIlustrado from '../mapaIlustrado.svelte';
	import TarjetaBoton from '../ui/tarjetaBoton.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		ubicaciones: TarjetaUbicacionPublica[];
	}

	let { titulo, ubicaciones }: Props = $props();

	// El estado "Abierto hasta…" se recalcula cada minuto
	let ahora = $state(new Date());
	$effect(() => {
		const intervalo = setInterval(() => (ahora = new Date()), 60_000);
		return () => clearInterval(intervalo);
	});

	const hoy = $derived(diaSemanaDe(ahora));
</script>

<TarjetaSeccion id="ubicacion" {titulo}>
	<ul class="space-y-4">
		{#each ubicaciones as ubicacion (ubicacion.id)}
			{@const estado = estadoApertura(ubicacion.horarios, ahora)}
			{@const lugar = ubicacion.nombre ?? ubicacion.direccion}
			<li class="overflow-hidden rounded-2xl border border-t-borde bg-t-superficie">
				<a
					href={mapsUrl(ubicacion)}
					target="_blank"
					rel="external noopener noreferrer"
					aria-label="Ver {lugar} en Google Maps"
					class="block h-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-t-primario"
				>
					<MapaIlustrado />
				</a>
				<div class="px-4 pt-3.5 pb-4">
					{#if ubicacion.nombre}
						<h3 class="font-t-titulos text-[1.0625rem] font-semibold text-t-titulo">
							{ubicacion.nombre}
						</h3>
					{/if}
					<p class="text-t-texto">
						{ubicacion.direccion}{#if ubicacion.ciudad}, {ubicacion.ciudad}{/if}
					</p>
					{#if estado}
						<p
							class={[
								'mt-2 flex items-center gap-1.5 text-sm font-semibold',
								estado.abierto ? 'text-t-primario' : 'text-t-texto-sec'
							]}
						>
							<ClockIcon class="size-4" />
							{estado.texto}
						</p>
					{/if}
					{#if ubicacion.horarios.length > 0}
						<details class="group mt-2">
							<summary
								class="cursor-pointer text-sm font-medium text-t-texto-sec underline decoration-t-borde underline-offset-4 marker:content-none"
							>
								Ver horarios
							</summary>
							<dl class="mt-2 space-y-1 text-sm">
								{#each resumenSemanal(ubicacion.horarios) as grupo (grupo.dias)}
									<div
										class={[
											'flex justify-between gap-4 rounded-lg px-2 py-1',
											grupo.incluye.includes(hoy) && 'bg-t-fondo font-semibold text-t-titulo'
										]}
									>
										<dt>{grupo.dias}</dt>
										<dd class="text-right tabular-nums">{grupo.horas}</dd>
									</div>
								{/each}
							</dl>
						</details>
					{/if}
					<TarjetaBoton
						href={comoLlegarUrl(ubicacion)}
						externo
						variante="contorno"
						size="sm"
						icono={NavigationIcon}
						class="mt-3.5"
					>
						Cómo llegar
					</TarjetaBoton>
				</div>
			</li>
		{/each}
	</ul>
</TarjetaSeccion>
