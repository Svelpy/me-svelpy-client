<!--
	Extracto del JSON-LD (Schema.org) que ME genera para un perfil, con resaltado mínimo.
-->
<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';
	import { ME_DOMINIO } from '../landing.content.ts';

	let { class: className = '' }: { class?: string } = $props();

	const codigo = `{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "Dra. Camila Rivas",
  "url": "https://${ME_DOMINIO}/dra-camila-rivas",
  "address": { "@type": "PostalAddress", "streetAddress": "Calle 7 Oeste 23" },
  "geo": { "@type": "GeoCoordinates", "latitude": …, "longitude": … },
  "openingHours": "Mo-Sa 09:00-20:00",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [
      { "@type": "Offer", "name": "Diseño de sonrisa" },
      { "@type": "Offer", "name": "Blanqueamiento LED", "price": "850", "priceCurrency": "BOB" }
    ]
  }
}`;

	type Token = { texto: string; tipo: 'clave' | 'texto' | 'numero' | 'otro' };

	function tokenizar(fuente: string): Token[] {
		const tokens: Token[] = [];
		const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)/g;
		let ultimo = 0;
		for (const m of fuente.matchAll(re)) {
			const i = m.index ?? 0;
			if (i > ultimo) tokens.push({ texto: fuente.slice(ultimo, i), tipo: 'otro' });
			if (m[1]) {
				tokens.push({ texto: m[1], tipo: m[2] ? 'clave' : 'texto' });
				if (m[2]) tokens.push({ texto: m[2], tipo: 'otro' });
			} else {
				tokens.push({ texto: m[0], tipo: 'numero' });
			}
			ultimo = i + m[0].length;
		}
		if (ultimo < fuente.length) tokens.push({ texto: fuente.slice(ultimo), tipo: 'otro' });
		return tokens;
	}

	const tokens = tokenizar(codigo);
	const colores: Record<Token['tipo'], string> = {
		clave: 'text-secondary',
		texto: 'text-white',
		numero: 'text-primary-300',
		otro: 'text-primary-400'
	};
</script>

<figure
	class={cn('overflow-hidden rounded-[1.75rem] bg-primary-900 ring-1 ring-primary-700', className)}
>
	<figcaption
		class="flex flex-wrap items-center justify-between gap-2 border-b border-primary-700 px-5 py-3 text-sm text-primary-300"
	>
		<span>Lo que leen Google y la IA en el perfil de la Dra. Camila Rivas</span>
		<span class="font-mono text-xs text-primary-400">application/ld+json</span>
	</figcaption>
	<pre class="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed sm:text-[13px]"><code
			>{#each tokens as token, i (i)}<span class={colores[token.tipo]}>{token.texto}</span
				>{/each}</code
		></pre>
</figure>
