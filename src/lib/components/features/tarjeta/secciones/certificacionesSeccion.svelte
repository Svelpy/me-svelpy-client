<script lang="ts">
	import { CertificateIcon, ExternalLinkIcon } from '#lib/icons/outline/index.ts';
	import type { IconoForma, TarjetaCertificacionPublica } from '#lib/interfaces/index.ts';
	import { todayISO } from '#lib/utils/date.ts';
	import { mesYAnio } from '#lib/utils/tarjeta.ts';
	import TarjetaIcono from '../ui/tarjetaIcono.svelte';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		certificaciones: TarjetaCertificacionPublica[];
		forma: IconoForma;
	}

	let { titulo, certificaciones, forma }: Props = $props();

	const hoy = todayISO();

	function vigencia(certificacion: TarjetaCertificacionPublica): string | null {
		if (certificacion.no_expira) return 'Sin vencimiento';
		if (!certificacion.fecha_expiracion) return null;
		const fecha = mesYAnio(certificacion.fecha_expiracion);
		return certificacion.fecha_expiracion < hoy ? `Venció en ${fecha}` : `Vigente hasta ${fecha}`;
	}
</script>

<TarjetaSeccion id="certificaciones" {titulo}>
	<ul class="space-y-3">
		{#each certificaciones as certificacion (certificacion.id)}
			<li class="flex gap-3 rounded-2xl border border-t-borde bg-t-superficie p-4">
				<TarjetaIcono icono={CertificateIcon} {forma} size="sm" />
				<div class="min-w-0 flex-1">
					<p class="font-semibold text-t-titulo">{certificacion.nombre}</p>
					{#if certificacion.entidad_emisora}<p class="text-t-texto">
							{certificacion.entidad_emisora}
						</p>{/if}
					<p class="mt-1 text-sm text-t-texto-sec">
						{#if certificacion.fecha_emision}Emitida en {mesYAnio(
								certificacion.fecha_emision
							)}.{/if}
						{vigencia(certificacion) ?? ''}
					</p>
					{#if certificacion.codigo_credencial}
						<p class="mt-1 text-sm text-t-texto-sec">
							Código <span class="font-mono text-t-texto">{certificacion.codigo_credencial}</span>
						</p>
					{/if}
					{#if certificacion.url_credencial}
						<a
							href={certificacion.url_credencial}
							target="_blank"
							rel="external noopener noreferrer"
							class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-t-primario underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-t-primario"
						>
							Verificar credencial
							<ExternalLinkIcon class="size-4" />
						</a>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</TarjetaSeccion>
