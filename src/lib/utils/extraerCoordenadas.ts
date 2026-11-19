/**
 * Coordenadas de un enlace de Google Maps, para llenar lat y lng al pegarlo:
 * `…/@-17.7833,-63.1821,17z`, `…!3d-17.78!4d-63.18`, `?q=-17.78,-63.18`, `?query=…`, `?ll=…`.
 * null si el enlace no trae coordenadas (p. ej. un enlace corto maps.app.goo.gl).
 */
const PATRONES = [
	/!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/,
	/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/,
	/[?&](?:q|query|ll|destination|center)=(-?\d{1,2}(?:\.\d+)?)(?:,|%2C)\s*(-?\d{1,3}(?:\.\d+)?)/i
];

export function extraerCoordenadas(url: string): { lat: number; lng: number } | null {
	for (const patron of PATRONES) {
		const match = patron.exec(url);
		if (!match) continue;
		const lat = Number(match[1]);
		const lng = Number(match[2]);
		if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
			// numeric(9,6) en la base de datos
			return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
		}
	}
	return null;
}
