<!--
	Metadatos de la landing: SEO clásico, Open Graph/Twitter (imagen 1200x630) y JSON-LD para buscadores
	e IAs (Organization, WebSite, Service y FAQPage).
-->
<script lang="ts">
	import { PUBLIC_SITE_URL } from '$app/env/public';
	import { siteOrigin } from '#lib/utils/siteUrl.ts';
	import { FAQ, LANDING_SEO, LOGOS } from './landing.content.ts';

	const base = siteOrigin(PUBLIC_SITE_URL);
	const url = `${base}/`;
	const ogImagen = `${base}${LANDING_SEO.ogImagen}`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': 'https://svelpy.com/#organization',
				name: 'Svelpy',
				url: 'https://svelpy.com'
			},
			{
				'@type': 'WebSite',
				'@id': `${url}#website`,
				url,
				name: 'ME',
				inLanguage: 'es',
				publisher: { '@id': 'https://svelpy.com/#organization' }
			},
			{
				'@type': 'Service',
				'@id': `${url}#service`,
				name: 'ME',
				serviceType: 'Tarjeta digital profesional y mini-web autoadministrable',
				description: LANDING_SEO.descripcion,
				url,
				logo: `${base}${LOGOS.completoClaro}`,
				image: ogImagen,
				provider: { '@id': 'https://svelpy.com/#organization' },
				audience: {
					'@type': 'Audience',
					audienceType:
						'Agentes inmobiliarios, médicos, odontólogos, abogados, consultores y equipos comerciales'
				}
			},
			{
				'@type': 'FAQPage',
				'@id': `${url}#faq`,
				mainEntity: FAQ.map((item) => ({
					'@type': 'Question',
					name: item.pregunta,
					acceptedAnswer: { '@type': 'Answer', text: item.respuesta }
				}))
			}
		]
	};

	// Se escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
	const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</${'script'}>`;
</script>

<svelte:head>
	<title>{LANDING_SEO.titulo}</title>
	<meta name="description" content={LANDING_SEO.descripcion} />
	<meta name="keywords" content={LANDING_SEO.keywords.join(', ')} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<meta name="theme-color" content={LANDING_SEO.themeColor} />
	<link rel="canonical" href={url} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="ME" />
	<meta property="og:locale" content={LANDING_SEO.locale} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={LANDING_SEO.titulo} />
	<meta property="og:description" content={LANDING_SEO.descripcion} />
	<meta property="og:image" content={ogImagen} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={LANDING_SEO.ogImagenAlt} />

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={LANDING_SEO.titulo} />
	<meta name="twitter:description" content={LANDING_SEO.descripcion} />
	<meta name="twitter:image" content={ogImagen} />
	<meta name="twitter:image:alt" content={LANDING_SEO.ogImagenAlt} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON estático generado aquí y escapado -->
	{@html jsonLdScript}
</svelte:head>
