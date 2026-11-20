<!--
	La tarjeta que se arma mientras la persona se registra: su enlace, su nombre y los colores y la
	tipografía que sugiere su rubro (los mismos con los que nacerá). Es solo una muestra: inerte.
-->
<script lang="ts">
	import TarjetaFuentes from '../tarjeta/tarjetaFuentes.svelte';
	import { valoresDeRubro } from '#lib/config/rubros.config.ts';
	import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import { familiaCss, tipografiaPorId } from '#lib/config/tipografiasTarjeta.config.ts';
	import { iniciales, nombreCompleto } from '#lib/utils/tarjeta.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';

	interface Props {
		slug: string;
		prefijo: string;
		nombres: string;
		apellidos: string;
		cargo: string;
		rubro: string;
	}

	let { slug, prefijo, nombres, apellidos, cargo, rubro }: Props = $props();

	const valores = $derived(valoresDeRubro(rubro));
	const tema = $derived(TEMAS_TARJETA[valores.preset]);
	const colores = $derived(tema.colores);
	const tipografia = $derived(tipografiaPorId(valores.tipografia));
	const nombre = $derived(nombreCompleto({ prefijo, nombres, apellidos }));
	const subtitulo = $derived(cargo.trim() || rubro.trim());
</script>

<TarjetaFuentes tipografias={[tipografia]} precargar={false} />

<div class="flex w-full max-w-[19rem] flex-col items-center">
	<div
		class="w-full overflow-hidden rounded-[2rem] border-[6px] border-light-two shadow-[0_24px_60px_-24px_rgb(42_24_45/0.45)] transition-colors duration-500 dark:border-dark-one_d"
		style:background={colores.color_fondo}
		inert
	>
		<div
			class="h-28 transition-colors duration-500"
			style:background={colores.color_primario}
		></div>
		<div class="-mt-11 flex flex-col items-center px-6 pb-8 text-center">
			<span
				class="grid size-[5.5rem] place-items-center rounded-full border-4 text-2xl font-semibold transition-colors duration-500"
				style:border-color={colores.color_fondo}
				style:background={colores.color_superficie}
				style:color={colores.color_titulo}
				style:font-family={familiaCss(tipografia.titulos)}
			>
				{iniciales({ prefijo, nombres, apellidos }) || '?'}
			</span>
			<p
				class="mt-4 text-[1.375rem] leading-tight text-balance transition-colors duration-500"
				class:opacity-40={!nombre}
				style:color={colores.color_titulo}
				style:font-family={familiaCss(tipografia.titulos)}
				style:font-weight={tipografia.pesoTitulos}
			>
				{nombre || 'Tu nombre'}
			</p>
			<p
				class="mt-1 text-sm transition-colors duration-500"
				class:opacity-50={!subtitulo}
				style:color={colores.color_texto_secundario}
				style:font-family={familiaCss(tipografia.texto)}
			>
				{subtitulo || 'A qué te dedicas'}
			</p>
			<span
				class="mt-6 flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500"
				style:background={colores.color_primario}
				style:color={colores.color_texto_sobre_primario}
				style:font-family={familiaCss(tipografia.texto)}
			>
				Guardar contacto
			</span>
			<div class="mt-3 grid w-full grid-cols-3 gap-2" aria-hidden="true">
				{#each { length: 3 } as _, indice (indice)}
					<span
						class="h-10 rounded-2xl border transition-colors duration-500"
						style:background={colores.color_superficie}
						style:border-color={colores.color_borde}
					></span>
				{/each}
			</div>
		</div>
	</div>
	<p
		class="mt-6 max-w-full truncate rounded-full bg-light-one px-4 py-2 font-mono text-sm text-light-two shadow-sm ring-1 ring-light-four/40 dark:bg-dark-one dark:text-dark-two dark:ring-dark-one_d"
	>
		{DOMINIO_PUBLICO}/<span class="font-semibold">{slug || 'tu-nombre'}</span>
	</p>
	<p class="mt-3 text-center text-xs text-light-two_d dark:text-dark-two_d">
		{rubro.trim()
			? `Tema ${tema.nombre} y tipografía ${tipografia.nombre}: los sugiere tu rubro.`
			: 'Los colores cambian según tu rubro.'}
	</p>
</div>
