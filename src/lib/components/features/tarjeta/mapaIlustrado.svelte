<!--
	Mapa ilustrado con los colores de la tarjeta (calles, manzanas y el pin). Es decorativo: el enlace
	que lo envuelve abre la ubicación real en Google Maps. Sin iframe: la tarjeta carga al instante.
-->
<svg
	viewBox="0 0 320 128"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	class="block h-full w-full"
>
	<rect width="320" height="128" fill="var(--t-superficie)" />
	<g fill="var(--t-secundario)" opacity="0.55">
		<rect x="22" y="14" width="64" height="34" rx="6" />
		<rect x="104" y="62" width="70" height="40" rx="6" />
		<rect x="214" y="18" width="48" height="30" rx="6" />
		<rect x="236" y="74" width="66" height="40" rx="6" />
	</g>
	<g stroke="var(--t-borde)" stroke-width="12" stroke-linecap="square" fill="none">
		<path d="M0 56 H320" />
		<path d="M196 0 V128" />
		<path d="M92 0 V128" />
		<path d="M0 116 H320" />
	</g>
	<path
		d="M-10 130 L140 -10"
		stroke="var(--t-fondo-icono)"
		stroke-width="16"
		fill="none"
		opacity="0.9"
	/>
	<g transform="translate(150 22)">
		<path
			d="M18 0C8 0 0 8 0 18c0 13 18 32 18 32s18-19 18-32C36 8 28 0 18 0z"
			fill="var(--t-primario)"
		/>
		<circle cx="18" cy="18" r="7" fill="var(--t-sobre-primario)" />
	</g>
</svg>
