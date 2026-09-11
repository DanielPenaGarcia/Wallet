export function toDateTimeLocal(isoDateTime: string): string {
	const date = new Date(isoDateTime);
	const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return localTime.toISOString().slice(0, 16);
}

export function currentDateTimeLocal(): string {
	return toDateTimeLocal(new Date().toISOString());
}
