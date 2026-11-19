/** Contraseña aleatoria fácil de dictar (sin 0/O ni 1/l/I), con letras y números */
export function generarPassword(largo = 10): string {
	const letras = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	const numeros = '23456789';
	const todos = letras + numeros;
	const aleatorio = new Uint32Array(largo);
	crypto.getRandomValues(aleatorio);
	const caracteres = Array.from(aleatorio, (valor) => todos[valor % todos.length]);
	// Garantiza al menos una letra y un número (lo exige la API)
	caracteres[0] = letras[aleatorio[0] % letras.length];
	caracteres[largo - 1] = numeros[aleatorio[largo - 1] % numeros.length];
	return caracteres.join('');
}
