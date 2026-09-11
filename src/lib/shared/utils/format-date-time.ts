const spanishDateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
	dateStyle: 'medium',
	timeStyle: 'short'
});

export function formatDateTime(value: string): string {
	return spanishDateTimeFormatter.format(new Date(value));
}
