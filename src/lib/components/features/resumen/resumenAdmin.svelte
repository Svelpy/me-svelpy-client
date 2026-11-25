<script lang="ts">
	import { resolve } from '$app/paths';
	import { METODO_PAGO_LABEL } from '#lib/constants/data.ts';
	import { formatNumber, formatRelativeTime } from '#lib/utils/format.ts';
	import { formatearMonto } from '#lib/utils/plan.ts';
	import MiniTarjeta from '../tarjetas/miniTarjeta.svelte';
	import type { ResumenPanel } from './resumen.ts';

	interface Props {
		resumen: ResumenPanel;
	}

	let { resumen }: Props = $props();

	const plural = (valor: number, uno: string, varios: string) => (valor === 1 ? uno : varios);

	const cifras = $derived(
		[
			{
				valor: resumen.totales.publicadas,
				etiqueta: plural(resumen.totales.publicadas, 'tarjeta publicada', 'tarjetas publicadas')
			},
			{
				valor: resumen.totales.borradores,
				etiqueta: plural(resumen.totales.borradores, 'borrador', 'borradores')
			},
			{
				valor: resumen.totales.cuentasActivas,
				etiqueta: plural(resumen.totales.cuentasActivas, 'cuenta activa', 'cuentas activas')
			},
			resumen.totales.cuentasPro !== null && {
				valor: resumen.totales.cuentasPro,
				etiqueta: plural(resumen.totales.cuentasPro, 'cuenta Pro', 'cuentas Pro')
			}
		].filter((cifra): cifra is { valor: number; etiqueta: string } => !!cifra)
	);

	const enlace =
		'text-sm font-semibold text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two';
</script>

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

<div class="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
	<section aria-labelledby="tarjetas-recientes">
		<div class="flex items-baseline justify-between gap-4">
			<h2 id="tarjetas-recientes" class="font-display text-xl font-semibold">Tarjetas</h2>
			<a href={resolve('/panel/tarjetas')} class={enlace}>Ver todas</a>
		</div>
		{#if resumen.tarjetas.length === 0}
			<p class="mt-5 text-sm text-light-two_d dark:text-dark-two_d">
				Todavía no hay tarjetas. Se crean al registrarse o desde una cuenta.
			</p>
		{:else}
			<!-- En el celular bastan 3: el resto está a un toque en "Ver todas" -->
			<ul
				class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 max-sm:[&>li:nth-child(n+4)]:hidden"
			>
				{#each resumen.tarjetas as tarjeta (tarjeta.id)}
					<li>
						<MiniTarjeta {tarjeta} href={resolve('/panel/tarjetas/[id]', { id: tarjeta.id })} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section aria-labelledby="pagos-recientes">
		<div class="flex items-baseline justify-between gap-4">
			<h2 id="pagos-recientes" class="font-display text-xl font-semibold">Últimos pagos</h2>
			<a href={resolve('/panel/pagos')} class={enlace}>Ver todos</a>
		</div>
		{#if resumen.pagos.length === 0}
			<p class="mt-5 text-sm text-light-two_d dark:text-dark-two_d">
				Aún no hay pagos. Se registran desde la cuenta de cada persona.
			</p>
		{:else}
			<ul class="mt-5 divide-y divide-light-four/35 dark:divide-dark-one_d">
				{#each resumen.pagos as pago (pago.id)}
					<li class="flex items-start justify-between gap-4 py-3 first:pt-0">
						<div class="min-w-0">
							<a
								href={resolve('/panel/usuarios/[id]', { id: pago.user_id })}
								class="block truncate text-sm font-medium hover:underline"
							>
								{pago.user.email}
							</a>
							<p class="text-xs text-light-two_d dark:text-dark-two_d">
								{pago.reverses_id
									? 'Anulación'
									: `${pago.plan.nombre}, ${METODO_PAGO_LABEL[pago.metodo]}`},
								{formatRelativeTime(pago.created_at)}
							</p>
						</div>
						<p
							class={[
								'shrink-0 text-sm font-semibold tabular-nums',
								pago.reverses_id && 'text-light-two_d dark:text-dark-two_d'
							]}
						>
							{pago.reverses_id ? '−' : ''}{formatearMonto(
								pago.monto.replace(/^-/, ''),
								pago.moneda
							)}
						</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
