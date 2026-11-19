<!--
	Datos con los que nace una tarjeta. La dirección se sugiere desde el nombre hasta que la persona
	la edita, y se revisa que esté libre mientras se escribe.
-->
<script lang="ts">
	import { Input } from '#lib/components/ui/index.ts';
	import { valoresDeRubro } from '#lib/config/rubros.config.ts';
	import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import { tipografiaPorId } from '#lib/config/tipografiasTarjeta.config.ts';
	import { PREFIJOS_SUGERIDOS } from '#lib/constants/data.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { sugerirSlug } from '#lib/utils/slug.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';
	import RubroCombobox from './rubroCombobox.svelte';

	interface Props {
		prefijo: string;
		nombres: string;
		apellidos: string;
		cargo: string;
		rubro: string;
		slug: string;
		/** Errores con el nombre de cada campo (o con un prefijo, p. ej. `tarjeta.slug`) */
		errores: Record<string, string>;
		prefijoErrores?: string;
	}

	let {
		prefijo = $bindable(),
		nombres = $bindable(),
		apellidos = $bindable(),
		cargo = $bindable(),
		rubro = $bindable(),
		slug = $bindable(),
		errores,
		prefijoErrores = ''
	}: Props = $props();

	const listaPrefijos = $props.id();
	let slugEditado = $state(false);
	let avisoSlug = $state('');
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	const error = (campo: string) => errores[`${prefijoErrores}${campo}`];

	$effect(() => {
		const sugerido = sugerirSlug({ prefijo, nombres, apellidos });
		if (!slugEditado) slug = sugerido;
	});

	$effect(() => {
		const actual = slug;
		clearTimeout(temporizador);
		avisoSlug = '';
		if (actual.length < 3) return;
		temporizador = setTimeout(async () => {
			try {
				const respuesta = await tarjetaService.slugDisponible(actual);
				if (actual !== slug) return;
				avisoSlug = respuesta.disponible
					? `${DOMINIO_PUBLICO}/${respuesta.slug} está libre.`
					: `${respuesta.motivo ?? 'No disponible.'}${respuesta.sugerencia ? ` Prueba con ${respuesta.sugerencia}.` : ''}`;
			} catch {
				avisoSlug = '';
			}
		}, 400);
	});

	const inicio = $derived.by(() => {
		if (!rubro.trim()) return null;
		const valores = valoresDeRubro(rubro);
		return `Empezará con el tema ${TEMAS_TARJETA[valores.preset].nombre} y la tipografía ${tipografiaPorId(valores.tipografia).nombre}. Podrás cambiarlos después.`;
	});
</script>

<div class="space-y-5">
	<div class="grid gap-5 sm:grid-cols-[8rem_1fr_1fr]">
		<Input
			label="Prefijo"
			list={listaPrefijos}
			placeholder="Dra."
			maxlength={30}
			bind:value={prefijo}
			error={error('prefijo')}
		/>
		<Input label="Nombres" required maxlength={150} bind:value={nombres} error={error('nombres')} />
		<Input label="Apellidos" maxlength={150} bind:value={apellidos} error={error('apellidos')} />
	</div>
	<datalist id={listaPrefijos}>
		{#each PREFIJOS_SUGERIDOS as opcion (opcion)}<option value={opcion}></option>{/each}
	</datalist>
	<div class="grid gap-5 sm:grid-cols-2">
		<RubroCombobox bind:value={rubro} error={error('rubro')} hint={inicio ?? undefined} />
		<Input
			label="Cargo"
			placeholder="Pediatra, Agente inmobiliaria…"
			maxlength={150}
			bind:value={cargo}
			error={error('cargo')}
		/>
	</div>
	<Input
		label="Dirección de la tarjeta"
		required
		maxlength={80}
		bind:value={slug}
		oninput={() => (slugEditado = true)}
		hint={avisoSlug || `Así la abrirán tus clientes: ${DOMINIO_PUBLICO}/${slug || 'tu-nombre'}`}
		error={error('slug')}
		mono
	/>
</div>
