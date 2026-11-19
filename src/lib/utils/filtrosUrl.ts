/**
 * Query string de un listado con filtros en la URL (?q=…&estado=…&page=…).
 * Un valor vacío o null quita el filtro y, salvo que el cambio sea de página, se vuelve a la
 * primera: con otros filtros, la página 3 puede no existir.
 */
export function queryConFiltros(
	actual: Iterable<[string, string]>,
	cambios: Record<string, string | null>
): string {
	const valores: Record<string, string | null> = { ...Object.fromEntries(actual), ...cambios };
	if (!('page' in cambios)) valores.page = null;
	const entradas = Object.entries(valores).filter((par): par is [string, string] =>
		Boolean(par[1])
	);
	return new URLSearchParams(entradas).toString();
}
