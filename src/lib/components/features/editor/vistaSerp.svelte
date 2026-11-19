<script lang="ts">
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';

	interface Props {
		titulo: string;
		descripcion: string;
		slug: string;
		indexable: boolean;
	}

	let { titulo, descripcion, slug, indexable }: Props = $props();
</script>

<!-- Aproximación de cómo se vería en Google: ayuda a escribir título y descripción -->
<figure class="rounded-2xl border border-light-four/40 p-4 dark:border-dark-one_d">
	<figcaption class="mb-3 text-xs font-medium text-light-two_d dark:text-dark-two_d">
		{indexable ? 'Así podría verse en Google' : 'Google no mostrará esta tarjeta'}
	</figcaption>
	<div class={['max-w-[37.5rem]', !indexable && 'opacity-50']}>
		<p class="truncate text-sm text-light-two_d dark:text-dark-two_d">{DOMINIO_PUBLICO} › {slug}</p>
		<p class="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
			{titulo}
		</p>
		<p class="mt-0.5 line-clamp-2 text-sm leading-relaxed text-light-two_d dark:text-dark-two_d">
			{descripcion}
		</p>
	</div>
</figure>
