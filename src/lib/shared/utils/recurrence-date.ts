import { lastDayOfMonth } from './local-date';

export type RecurrenceMonthDay = number | 'last';
export type RecurrenceIntervalUnit = 'days' | 'weeks' | 'months' | 'years';

export const weekDayIndex = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6
} as const;

export function parseLocalDate(value: string) {
	const [datePart] = value.split('T');
	const [year, month, day] = datePart.split('-').map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
}

export function startOfLocalDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

export function nextWeekday(date: Date, weekday: number) {
	const daysUntil = (weekday - date.getDay() + 7) % 7 || 7;
	return addDays(date, daysUntil);
}

export function nextMonthlyDate(date: Date, day: RecurrenceMonthDay) {
	const currentMonthCandidate = clampedMonthDate(date.getFullYear(), date.getMonth(), day);
	if (currentMonthCandidate > date) return currentMonthCandidate;
	return clampedMonthDate(date.getFullYear(), date.getMonth() + 1, day);
}

export function nextSemimonthlyDate(date: Date, firstDay: number, secondDay: RecurrenceMonthDay) {
	const candidates = [
		clampedMonthDate(date.getFullYear(), date.getMonth(), firstDay),
		clampedMonthDate(date.getFullYear(), date.getMonth(), secondDay),
		clampedMonthDate(date.getFullYear(), date.getMonth() + 1, firstDay),
		clampedMonthDate(date.getFullYear(), date.getMonth() + 1, secondDay)
	].sort((a, b) => a.getTime() - b.getTime());

	return candidates.find((candidate) => candidate > date) ?? candidates[candidates.length - 1];
}

export function nextYearlyDate(date: Date, month: number, day: RecurrenceMonthDay) {
	const currentYearCandidate = clampedMonthDate(date.getFullYear(), month - 1, day);
	if (currentYearCandidate > date) return currentYearCandidate;
	return clampedMonthDate(date.getFullYear() + 1, month - 1, day);
}

export function addCustomInterval(date: Date, count: number, unit: RecurrenceIntervalUnit) {
	if (unit === 'days') return addDays(date, count);
	if (unit === 'weeks') return addDays(date, count * 7);
	if (unit === 'months') return clampedMonthDate(date.getFullYear(), date.getMonth() + count, date.getDate());
	return clampedMonthDate(date.getFullYear() + count, date.getMonth(), date.getDate());
}

export function clampedMonthDate(year: number, month: number, preferredDay: RecurrenceMonthDay) {
	const normalized = new Date(year, month, 1);
	const lastDay = lastDayOfMonth(normalized.getFullYear(), normalized.getMonth());
	const day = preferredDay === 'last' ? lastDay : Math.min(preferredDay, lastDay);
	return new Date(normalized.getFullYear(), normalized.getMonth(), day);
}
