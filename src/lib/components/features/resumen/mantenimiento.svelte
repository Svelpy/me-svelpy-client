<!--
	Las dos tareas que corre el servidor solo cada día, para cuando hacen falta ya: despublicar las
	tarjetas con el plan vencido y borrar las imágenes subidas que nadie usa. Se pueden repetir.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/index.ts';
	import { errorService, imagenService, tarjetaService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';

	interface Props {
		/** Tras despublicar, para refrescar las cifras */
		onDespublicadas?: () => void;
	}

	let { onDespublicadas }: Props = $props();

	let corriendo = $state<'vencidas' | 'imagenes' | null>(null);

	async function despublicar() {
		corriendo = 'vencidas';
		try {
			const { despublicadas } = await tarjetaService.despublicarVencidas();
			alert(
				'success',
				despublicadas === 0
					? 'No había tarjetas con el plan vencido'
					: despublicadas === 1
						? 'Se despublicó 1 tarjeta'
						: `Se despublicaron ${despublicadas} tarjetas`
			);
			if (despublicadas > 0) onDespublicadas?.();
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			corriendo = null;
		}
	}

	async function limpiar() {
		corriendo = 'imagenes';
		try {
			const { eliminadas } = await imagenService.limpiarHuerfanas();
			alert(
				'success',
				eliminadas === 0
					? 'No había imágenes sin usar'
					: eliminadas === 1
						? 'Se borró 1 imagen sin usar'
						: `Se borraron ${eliminadas} imágenes sin usar`
			);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			corriendo = null;
		}
	}
</script>

<section
	aria-labelledby="mantenimiento"
	class="mt-14 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
>
	<h2 id="mantenimiento" class="font-display text-lg font-semibold">Mantenimiento</h2>
	<p class="mt-1 max-w-prose text-sm text-light-two_d dark:text-dark-two_d">
		El servidor hace esto solo cada día. Úsalo si necesitas que pase ahora.
	</p>
	<div class="mt-5 grid gap-4 md:grid-cols-2">
		<div
			class="flex flex-col items-start gap-3 rounded-2xl border border-light-four/40 p-4 dark:border-dark-one_d"
		>
			<div>
				<p class="font-medium">Despublicar tarjetas vencidas</p>
				<p class="text-sm text-light-two_d dark:text-dark-two_d">
					Las de cuentas cuyo plan ya venció dejan de verse hasta que se renueve.
				</p>
			</div>
			<Button
				variant="secondary"
				size="sm"
				loading={corriendo === 'vencidas'}
				disabled={corriendo !== null}
				onclick={despublicar}
			>
				Despublicar vencidas
			</Button>
		</div>
		<div
			class="flex flex-col items-start gap-3 rounded-2xl border border-light-four/40 p-4 dark:border-dark-one_d"
		>
			<div>
				<p class="font-medium">Limpiar imágenes sin usar</p>
				<p class="text-sm text-light-two_d dark:text-dark-two_d">
					Borra las subidas de hace más de un día que ninguna tarjeta usa.
				</p>
			</div>
			<Button
				variant="secondary"
				size="sm"
				loading={corriendo === 'imagenes'}
				disabled={corriendo !== null}
				onclick={limpiar}
			>
				Limpiar imágenes
			</Button>
		</div>
	</div>
</section>
