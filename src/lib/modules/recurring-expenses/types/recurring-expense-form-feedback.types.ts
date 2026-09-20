import type {
	RecurringExpenseFrequency,
	RecurringExpensePaymentSchedule
} from './recurring-expense.types';
import type { ExpenseAmountKind, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';

export type RecurringExpenseFormValues = {
	id?: string;
	name?: string;
	categoryId?: string;
	amount?: string;
	amountKind?: ExpenseAmountKind;
	frequency?: RecurringExpenseFrequency;
	customIntervalCount?: string;
	customIntervalUnit?: ExpenseIntervalUnit | '';
	weeklyDay?: string;
	semimonthlyFirstDay?: string;
	semimonthlySecondDay?: string;
	monthlyDay?: string;
	yearlyMonth?: string;
	yearlyDay?: string;
	statementDay?: string;
	lastPaidAt?: string;
	parsedPaymentSchedule?: RecurringExpensePaymentSchedule;
	isActive?: boolean;
};

export type RecurringExpenseFormFeedback = {
	action: 'create-recurring-expense' | 'update-recurring-expense' | 'delete-recurring-expense';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: RecurringExpenseFormValues;
};
