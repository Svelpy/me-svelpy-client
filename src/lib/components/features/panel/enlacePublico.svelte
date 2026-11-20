<script lang="ts">
	import { resolve } from '$app/paths';
	import { CopyButton } from '#lib/components/ui/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { DOMINIO_PUBLICO, urlPublicaTarjeta } from '#lib/utils/urlPublica.ts';
	import EstadoPublicacion from './estadoPublicacion.svelte';

	interface Props {
		slug: string;
		publicada: boolean;
		/** Sin el estado (cuando ya se muestra al lado) */
		sinEstado?: boolean;
		class?: string;
	}

	let { slug, publicada, sinEstado = false, class: className }: Props = $props();
</script>

<!-- El enlace de la tarjeta: es su identidad, por eso va en monoespaciada -->
<!-- Sin espacio, el enlace baja a su propia línea junto con su botón de copiar -->
<div class={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1', className)}>
	{#if !sinEstado}<EstadoPublicacion {publicada} />{/if}
	<span class="flex min-w-0 items-center">
		<a
			href={resolve('/[slug]', { slug })}
			target="_blank"
			rel="noopener"
			title={publicada
				? 'Abrir la tarjeta pública en otra pestaña'
				: 'La tarjeta aún no está publicada'}
			class="min-w-0 truncate rounded-lg px-1.5 py-1 font-mono text-[0.8125rem] text-light-two_d transition-colors hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
		>
			{DOMINIO_PUBLICO}/<span class="text-light-two dark:text-dark-two">{slug}</span>
		</a>
		<CopyButton
			texto={urlPublicaTarjeta(slug)}
			soloIcono
			size="xs"
			variant="ghost"
			label="Copiar el enlace de la tarjeta"
		/>
	</span>
</div>
