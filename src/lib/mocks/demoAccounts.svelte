<!--
	Solo con datos de prueba: atajo para entrar con una cuenta sembrada. Al pasar a la API real se
	borra junto con la carpeta `src/lib/mocks` (y su uso en el login).
-->
<script lang="ts">
	import { restablecerDatosDePrueba } from './seed/index.ts';
	import { CUENTAS_DE_PRUEBA } from './seed/usuarios.seed.ts';

	interface Props {
		onUsar: (email: string, password: string) => void;
	}

	let { onUsar }: Props = $props();

	let restableciendo = $state(false);
	let mensaje = $state('');

	async function restablecer() {
		restableciendo = true;
		try {
			await restablecerDatosDePrueba();
			mensaje = 'Listo: los datos de prueba volvieron a su estado inicial.';
		} finally {
			restableciendo = false;
		}
	}
</script>

<section
	aria-labelledby="cuentas-prueba"
	class="rounded-2xl border border-dashed border-light-four p-4 dark:border-dark-four"
>
	<h2 id="cuentas-prueba" class="text-sm font-semibold text-light-two dark:text-dark-two">
		Cuentas de prueba
	</h2>
	<p class="mt-0.5 text-xs text-light-two_d dark:text-dark-two_d">
		Los datos viven en este navegador. Elige una cuenta para completar el formulario.
	</p>
	<!-- Se desvanece abajo para que se note que hay más cuentas al desplazar -->
	<ul
		class="mt-3 max-h-60 space-y-0.5 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)] pr-1 pb-8"
	>
		{#each CUENTAS_DE_PRUEBA as cuenta (cuenta.email)}
			<li>
				<button
					type="button"
					onclick={() => onUsar(cuenta.email, cuenta.password)}
					class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-light-one_d focus-visible:outline-2 focus-visible:outline-light-three dark:hover:bg-dark-one_d dark:focus-visible:outline-dark-three"
				>
					<span class="min-w-0">
						<span class="block truncate text-sm font-medium text-light-two dark:text-dark-two">
							{cuenta.descripcion}
						</span>
						<span class="block truncate text-xs text-light-two_d dark:text-dark-two_d">
							{cuenta.email}
						</span>
					</span>
					<span class="shrink-0 text-xs font-semibold text-light-two_d dark:text-dark-two_d">
						Usar
					</span>
				</button>
			</li>
		{/each}
	</ul>
	<p class="mt-3 text-xs text-light-two_d dark:text-dark-two_d">
		Contraseña de los propietarios: <strong class="font-semibold text-light-two dark:text-dark-two">
			Demo1234
		</strong>. Superadministrador:
		<strong class="font-semibold text-light-two dark:text-dark-two">Admin1234</strong>.
	</p>
	<button
		type="button"
		onclick={restablecer}
		disabled={restableciendo}
		class="mt-3 text-xs font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two disabled:opacity-50 dark:text-dark-two dark:decoration-dark-four"
	>
		{restableciendo ? 'Restableciendo…' : 'Restablecer datos de prueba'}
	</button>
	<p class="mt-1 text-xs text-light-two_d dark:text-dark-two_d" role="status">{mensaje}</p>
</section>
