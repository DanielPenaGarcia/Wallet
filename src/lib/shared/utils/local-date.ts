import type { IsoDate } from '$lib/shared/types/date.types';

export function startOfLocalDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toIsoDate(date: Date): IsoDate {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}` as IsoDate;
}

export function lastDayOfMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate();
}
