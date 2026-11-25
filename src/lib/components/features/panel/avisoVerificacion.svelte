<!--
	Franja bajo la barra del panel mientras el correo no está verificado: sin verificar no se publica.
	Callada (tinta y un punto de aviso), con una sola acción.
-->
<script lang="ts">
	import { authService, errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';

	interface Props {
		email: string;
	}

	let { email }: Props = $props();

	let reenviando = $state(false);
	let enviado = $state(false);

	async function reenviar() {
		reenviando = true;
		try {
			await authService.reenviarVerificacion();
			enviado = true;
			alert('success', `Enlace enviado a ${email}`);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			reenviando = false;
		}
	}
</script>

<div
	role="status"
	class="border-b border-light-four/40 bg-light-one_d/70 dark:border-dark-one_d dark:bg-dark-one_d/50"
>
	<div
		class="mx-auto flex max-w-[100rem] flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-sm sm:px-6 lg:px-8"
	>
		<p class="flex min-w-0 items-center gap-2">
			<span
				class="size-1.5 shrink-0 rounded-full bg-light-warning dark:bg-dark-warning"
				aria-hidden="true"
			></span>
			<span>
				Verifica tu correo para poder publicar: te enviamos un enlace a
				<span class="font-semibold break-all">{email}</span>.
			</span>
		</p>
		<button
			type="button"
			onclick={reenviar}
			disabled={reenviando || enviado}
			class="rounded font-semibold underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three disabled:no-underline disabled:opacity-60 dark:decoration-dark-four dark:hover:decoration-dark-two dark:focus-visible:outline-dark-three"
		>
			{enviado ? 'Enlace enviado' : reenviando ? 'Enviando…' : 'Reenviar enlace'}
		</button>
	</div>
</div>
