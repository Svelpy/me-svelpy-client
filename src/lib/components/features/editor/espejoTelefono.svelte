<!--
	El espejo: la tarjeta tal como la verá el cliente en su celular, con los cambios sin guardar.
	Es lo único con color en el panel; el marco es tinta y papel para no competir con la tarjeta.
-->
<script lang="ts">
	import TarjetaVista from '../tarjeta/tarjetaVista.svelte';
	import type { TarjetaCompleta } from '#lib/interfaces/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';

	interface Props {
		tarjeta: TarjetaCompleta;
		/** Hay cambios que aún no se guardaron */
		sinGuardar?: boolean;
		class?: string;
	}

	let { tarjeta, sinGuardar = false, class: className }: Props = $props();
</script>

<figure class={cn('flex flex-col items-center', className)}>
	<div
		class="flex h-full w-full max-w-[22rem] flex-col rounded-[2.5rem] border border-light-four/50 bg-light-one_d p-2 shadow-[0_24px_60px_-28px_rgb(28_15_30/0.45)] dark:border-dark-one_d dark:bg-[#0f0810]"
	>
		<div class="flex h-9 shrink-0 items-center justify-center px-5">
			<span
				class="block max-w-full truncate rounded-full bg-light-one px-3 py-1 font-mono text-[0.6875rem] text-light-two_d dark:bg-dark-one_d dark:text-dark-two_d"
			>
				{DOMINIO_PUBLICO}/<span class="text-light-two dark:text-dark-two">{tarjeta.slug}</span>
			</span>
		</div>
		<!-- La pantalla no se desplaza; adentro sí: así el botón flotante queda fijo como en un celular -->
		<div class="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] ring-1 ring-black/5">
			<div class="h-full overflow-y-auto overscroll-contain" data-espejo>
				<TarjetaVista {tarjeta} modo="vista-previa" />
			</div>
		</div>
	</div>
	<figcaption
		class="mt-3 text-center text-xs text-light-two_d dark:text-dark-two_d"
		aria-live="polite"
	>
		{sinGuardar ? 'Vista previa con cambios sin guardar' : 'Así se ve tu tarjeta ahora'}
	</figcaption>
</figure>
