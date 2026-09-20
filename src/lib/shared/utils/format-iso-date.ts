export function formatIsoDate(value: string | null) {
	if (!value) return 'No disponible';
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return value;
	return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(year, month - 1, day));
}
