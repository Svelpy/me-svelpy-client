<script lang="ts">
	import TarjetaFuentes from '#lib/components/features/tarjeta/tarjetaFuentes.svelte';
	import { TIPOGRAFIAS_TARJETA } from '#lib/config/tipografiasTarjeta.config.ts';
	import { resolve } from '$app/paths';
	import type { ResumenAdmin } from '#lib/interfaces/index.ts';
	import { formatNumber } from '#lib/utils/format.ts';
	import MiniTarjeta from '../tarjetas/miniTarjeta.svelte';
	import BarrasRubro from './barrasRubro.svelte';

	interface Props {
		resumen: ResumenAdmin;
	}

	let { resumen }: Props = $props();

	const cifras = $derived([
		{
			valor: resumen.totales.publicadas,
			etiqueta: resumen.totales.publicadas === 1 ? 'tarjeta publicada' : 'tarjetas publicadas'
		},
		{
			valor: resumen.totales.borradores,
			etiqueta: resumen.totales.borradores === 1 ? 'borrador' : 'borradores'
		},
		{
			valor: resumen.totales.usuarios_activos,
			etiqueta: resumen.totales.usuarios_activos === 1 ? 'cuenta activa' : 'cuentas activas'
		},
		{
			valor: resumen.totales.cuentas_pro,
			etiqueta: resumen.totales.cuentas_pro === 1 ? 'cuenta Pro' : 'cuentas Pro'
		},
		{
			valor: resumen.totales.usuarios_sin_tarjeta,
			etiqueta:
				resumen.totales.usuarios_sin_tarjeta === 1 ? 'cuenta sin tarjeta' : 'cuentas sin tarjeta'
		}
	]);
</script>

<!-- Las mini-tarjetas muestran el nombre con la fuente de cada una -->
<TarjetaFuentes tipografias={TIPOGRAFIAS_TARJETA} precargar={false} />

<!-- Cifras en una línea: valor grande y lo que cuenta debajo, sin cajas -->
<dl
	class="flex flex-wrap gap-x-12 gap-y-6 border-b border-light-four/40 pb-8 dark:border-dark-one_d"
>
	{#each cifras as cifra (cifra.etiqueta)}
		<div class="flex flex-col-reverse">
			<dt class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">{cifra.etiqueta}</dt>
			<dd class="font-display text-[2.5rem] leading-none font-semibold tracking-tight tabular-nums">
				{formatNumber(cifra.valor)}
			</dd>
		</div>
	{/each}
</dl>

{#if resumen.totales.usuarios_sin_tarjeta > 0}
	<p class="mt-5 text-sm text-light-two_d dark:text-dark-two_d">
		Hay cuentas esperando su tarjeta.
		<a
			href={resolve('/panel/tarjetas/nueva')}
			class="font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four"
		>
			Crear una tarjeta
		</a>
	</p>
{/if}

<div class="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_20rem]">
	<section aria-labelledby="recientes">
		<div class="flex items-baseline justify-between gap-4">
			<h2 id="recientes" class="font-display text-xl font-semibold">Actualizadas hace poco</h2>
			<a
				href={resolve('/panel/tarjetas')}
				class="text-sm font-semibold text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two"
			>
				Ver todas
			</a>
		</div>
		<!-- En el celular bastan 3: el resto está a un toque en "Ver todas" -->
		<ul
			class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 max-sm:[&>li:nth-child(n+4)]:hidden"
		>
			{#each resumen.recientes as tarjeta (tarjeta.id)}
				<li>
					<MiniTarjeta {tarjeta} href={resolve('/panel/tarjetas/[id]', { id: tarjeta.id })} />
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="por-rubro">
		<h2 id="por-rubro" class="font-display text-xl font-semibold">Tarjetas por rubro</h2>
		<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
			Elige un rubro para ver sus tarjetas.
		</p>
		<div class="mt-5">
			<BarrasRubro filas={resumen.por_rubro} />
		</div>
	</section>
</div>
