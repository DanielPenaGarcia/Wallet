import { toIsoDate } from '$lib/shared/utils/local-date';
import {
	addCustomInterval,
	addDays,
	clampedMonthDate,
	nextSemimonthlyDate,
	nextWeekday,
	nextYearlyDate,
	parseLocalDate,
	weekDayIndex
} from '$lib/shared/utils/recurrence-date';
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

function addMonthsClamped(base: Date, count: number, preferredDay: number | 'last') {
	return clampedMonthDate(base.getFullYear(), base.getMonth() + count, preferredDay);
}
