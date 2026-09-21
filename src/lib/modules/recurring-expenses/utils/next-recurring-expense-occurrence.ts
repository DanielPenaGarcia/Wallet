import { toIsoDate } from '$lib/shared/utils/local-date';
import { parseLocalDate } from '$lib/shared/utils/recurrence-date';
import { nextRecurringPaymentDate } from '$lib/shared/utils/recurring-payment-schedule';
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

	const nextDate = nextRecurringPaymentDate(base, expense.paymentSchedule, {
		monthlyMode: 'next-period',
		customInterval: {
			count: expense.customIntervalCount,
			unit: expense.customIntervalUnit
		}
	});

	return nextDate ? toIsoDate(nextDate) : null;
}
