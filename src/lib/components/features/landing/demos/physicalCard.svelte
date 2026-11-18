<!--
	Tarjeta física ME con código QR (el QR real apunta a me.svelpy.com).
-->
<script lang="ts">
	import qrMe from '#lib/assets/landing/qr-me-svelpy.svg';
	import { cn } from '#lib/utils/cn.ts';
	import { LOGOS, ME_DOMINIO } from '../landing.content.ts';

	interface Props {
		nombre: string;
		cargo: string;
		slug: string;
		class?: string;
	}

	let { nombre, cargo, slug, class: className = '' }: Props = $props();
</script>

<div
	role="img"
	aria-label={`Tarjeta física ME de ${nombre} con código QR que abre su perfil`}
	class={cn(
		'flex aspect-[85.6/54] w-[236px] flex-col justify-between rounded-2xl bg-primary-900 p-4 text-white ring-1 ring-white/15',
		className
	)}
>
	<div class="flex items-start justify-between gap-3">
		<img src={LOGOS.isotipoOscuro} alt="" class="h-[18px] w-auto" width="31" height="18" />
		<span class="grid size-[68px] shrink-0 place-items-center rounded-lg bg-white p-1.5">
			<img src={qrMe} alt="" class="size-full" width="56" height="56" />
		</span>
	</div>
	<div class="min-w-0">
		<p class="truncate font-display text-[15px] leading-tight font-bold tracking-[-0.01em]">
			{nombre}
		</p>
		<p class="truncate text-[11px] text-primary-300">{cargo}</p>
		<p class="mt-1 truncate font-mono text-[9.5px] text-secondary">{ME_DOMINIO}/{slug}</p>
	</div>
</div>
