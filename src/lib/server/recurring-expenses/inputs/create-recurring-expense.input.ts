import type { ExpenseAmountKind, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
import type {
	RecurringExpenseFrequency,
	RecurringExpensePaymentSchedule
} from '$lib/modules/recurring-expenses/types/recurring-expense.types';

export type CreateRecurringExpenseInput = {
	name: string;
	categoryId: string;
	amountCents: number;
	amountKind: ExpenseAmountKind;
	frequency: RecurringExpenseFrequency;
	customIntervalCount: number | null;
	customIntervalUnit: ExpenseIntervalUnit | null;
	paymentSchedule: RecurringExpensePaymentSchedule;
	statementDay: number | null;
	lastPaidAt: string | null;
	isActive: boolean;
};
