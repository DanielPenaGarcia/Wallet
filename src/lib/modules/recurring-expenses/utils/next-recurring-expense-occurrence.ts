import { lastDayOfMonth, toIsoDate } from '$lib/shared/utils/local-date';
import type { RecurringExpense } from '../types/recurring-expense.types';

type RecurrenceInput = Pick<
	RecurringExpense,
	| 'frequency'
	| 'customIntervalCount'
	| 'customIntervalUnit'
	| 'paymentSchedule'
	| 'lastPaidAt'
	| 'createdAt'
	| 'isActive'
>;

const weekDayIndex = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6
};

export function calculateNextRecurringExpenseOccurrence(expense: RecurrenceInput) {
	if (!expense.isActive) return null;

	const base = parseLocalDate(expense.lastPaidAt ?? expense.createdAt);
	if (!base) return null;

	if (expense.frequency === 'daily') return toIsoDate(addDays(base, 1));
	if (expense.frequency === 'weekly' && expense.paymentSchedule.type === 'weekly') {
		return toIsoDate(nextWeekday(base, weekDayIndex[expense.paymentSchedule.weekday]));
	}
	if (expense.frequency === 'semimonthly' && expense.paymentSchedule.type === 'semimonthly') {
		return toIsoDate(nextSemimonthlyDate(base, expense.paymentSchedule.firstDay, expense.paymentSchedule.secondDay));
	}
	if (expense.frequency === 'monthly' && expense.paymentSchedule.type === 'monthly') {
		return toIsoDate(addMonthsClamped(base, 1, expense.paymentSchedule.day));
	}
	if (expense.frequency === 'yearly' && expense.paymentSchedule.type === 'yearly') {
		return toIsoDate(nextYearlyDate(base, expense.paymentSchedule.month, expense.paymentSchedule.day));
	}
	if (expense.frequency === 'custom' && expense.customIntervalCount && expense.customIntervalUnit) {
		return toIsoDate(addCustomInterval(base, expense.customIntervalCount, expense.customIntervalUnit));
	}

	return null;
}

function parseLocalDate(value: string) {
	const [datePart] = value.split('T');
	const [year, month, day] = datePart.split('-').map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function nextWeekday(base: Date, weekday: number) {
	const daysUntil = (weekday - base.getDay() + 7) % 7 || 7;
	return addDays(base, daysUntil);
}

function nextSemimonthlyDate(base: Date, firstDay: number, secondDay: number | 'last') {
	const candidates = [
		clampedMonthDate(base.getFullYear(), base.getMonth(), firstDay),
		clampedMonthDate(base.getFullYear(), base.getMonth(), secondDay),
		clampedMonthDate(base.getFullYear(), base.getMonth() + 1, firstDay),
		clampedMonthDate(base.getFullYear(), base.getMonth() + 1, secondDay)
	].sort((a, b) => a.getTime() - b.getTime());

	return candidates.find((candidate) => candidate.getTime() > base.getTime()) ?? candidates[candidates.length - 1];
}

function nextYearlyDate(base: Date, month: number, day: number | 'last') {
	const currentYear = clampedMonthDate(base.getFullYear(), month - 1, day);
	if (currentYear.getTime() > base.getTime()) return currentYear;
	return clampedMonthDate(base.getFullYear() + 1, month - 1, day);
}

function addCustomInterval(base: Date, count: number, unit: NonNullable<RecurringExpense['customIntervalUnit']>) {
	if (unit === 'days') return addDays(base, count);
	if (unit === 'weeks') return addDays(base, count * 7);
	if (unit === 'months') return addMonthsClamped(base, count, base.getDate());
	return clampedMonthDate(base.getFullYear() + count, base.getMonth(), base.getDate());
}

function addMonthsClamped(base: Date, count: number, preferredDay: number | 'last') {
	return clampedMonthDate(base.getFullYear(), base.getMonth() + count, preferredDay);
}

function clampedMonthDate(year: number, month: number, preferredDay: number | 'last') {
	const normalized = new Date(year, month, 1);
	const lastDay = lastDayOfMonth(normalized.getFullYear(), normalized.getMonth());
	const day = preferredDay === 'last' ? lastDay : Math.min(preferredDay, lastDay);
	return new Date(normalized.getFullYear(), normalized.getMonth(), day);
}
