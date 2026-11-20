/** Fecha en formato YYYY-MM-DD (hora local) */
export function toISODate(date: Date): string {
	return date.toLocaleDateString('en-CA');
}

/** Fecha de hoy en formato YYYY-MM-DD (hora local) */
export function todayISO(): string {
	return toISODate(new Date());
}

/** Última fecha de nacimiento (YYYY-MM-DD) con la que hoy se tienen al menos `years` años */
export function latestBirthDateForAge(years: number): string {
	const [year, month, day] = todayISO().split('-');
	return `${Number(year) - years}-${month}-${day}`;
}

/** El último instante (hora local) del día de `fecha`, en ISO */
export function finDelDia(fecha: string | Date): string {
	const dia = new Date(fecha);
	dia.setHours(23, 59, 59, 999);
	return dia.toISOString();
}
