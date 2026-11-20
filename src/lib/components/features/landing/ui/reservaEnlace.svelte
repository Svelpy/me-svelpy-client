<!--
	Cápsula «me.svelpy.com/tu-nombre» + «Crear mi ME gratis»: lleva al registro con el enlace ya
	escrito (`/auth/sign-up?enlace=`). Es un formulario GET, así que funciona aun sin JavaScript;
	la disponibilidad la revisa el primer paso del registro.
-->
<script lang="ts">
	import { limpiarSlugEscrito } from '#lib/utils/slug.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { CTA_CREAR, LANDING_LINKS, ME_DOMINIO } from '../landing.content.ts';

	interface Props {
		/** Texto del botón; por defecto la acción única de registro */
		cta?: string;
		class?: string;
	}

	let { cta = CTA_CREAR, class: className = '' }: Props = $props();

	const id = $props.id();
	let enlace = $state('');

	/** Sin guiones sueltos al final al salir del campo ni al enviar */
	const recortar = () => (enlace = enlace.replace(/-+$/, ''));
</script>

<form
	action={LANDING_LINKS.registro}
	method="GET"
	onsubmit={recortar}
	class={cn('flex w-full max-w-xl flex-col gap-2.5 sm:flex-row', className)}
>
	<label
		for="{id}-enlace"
		class="flex h-14 min-w-0 cursor-text items-center rounded-full bg-white pl-6 text-primary-950 ring-1 ring-primary-200 focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-secondary sm:h-16 sm:flex-1"
	>
		<span aria-hidden="true" class="shrink-0 text-[1.0625rem] text-primary-500">{ME_DOMINIO}/</span>
		<input
			id="{id}-enlace"
			name="enlace"
			aria-label="Tu enlace"
			type="text"
			bind:value={enlace}
			oninput={() => (enlace = limpiarSlugEscrito(enlace))}
			onblur={recortar}
			placeholder="tu-nombre"
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
			maxlength="60"
			class="h-full w-full min-w-0 border-0 bg-transparent p-0 pr-4 text-[1.0625rem] font-semibold text-primary-950 shadow-none ring-0 outline-none placeholder:font-normal placeholder:text-primary-400 focus:border-0 focus:ring-0 focus:outline-none"
		/>
	</label>
	<button
		type="submit"
		class="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-secondary px-7 text-[1.0625rem] font-semibold whitespace-nowrap text-primary-950 transition-colors hover:bg-secondary-400 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white sm:h-16 sm:px-8"
	>
		{cta}
	</button>
</form>
