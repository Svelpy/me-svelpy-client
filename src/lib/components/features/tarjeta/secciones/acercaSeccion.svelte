<script lang="ts">
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		texto: string;
	}

	let { titulo, texto }: Props = $props();
</script>

<TarjetaSeccion id="acerca" {titulo}>
	<p class="max-w-[62ch] text-[1.0625rem] leading-relaxed whitespace-pre-line text-t-texto">
		{texto}
	</p>
</TarjetaSeccion>
