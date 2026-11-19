<script lang="ts">
	import { Combobox, type OpcionCombobox } from '#lib/components/ui/index.ts';
	import { RUBROS } from '#lib/config/rubros.config.ts';

	interface Props {
		value: string;
		error?: string;
		hint?: string;
		onseleccionar?: (rubro: string) => void;
		class?: string;
	}

	let { value = $bindable(), error, hint, onseleccionar, class: className }: Props = $props();

	const opciones: OpcionCombobox[] = RUBROS.map((rubro) => ({
		valor: rubro.nombre,
		etiqueta: rubro.nombre,
		grupo: rubro.grupo
	}));
</script>

<!-- Sugiere los rubros del catálogo pero acepta cualquier texto: el rubro es libre -->
<Combobox
	label="Rubro"
	required
	bind:value
	{opciones}
	placeholder="Escribe para buscar: pediatría, abogacía…"
	hint={hint ?? 'Ayuda a Google y a las IAs a saber a qué te dedicas.'}
	{error}
	onseleccionar={(valor) => onseleccionar?.(valor)}
	class={className}
/>
