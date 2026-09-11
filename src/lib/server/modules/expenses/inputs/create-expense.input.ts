import type {
	ExpenseAmountKind,
	ExpenseClassification,
	ExpenseFrequency,
	ExpenseIntervalUnit
} from '$lib/modules/expenses/types/expense.types';

export type CreateExpenseInput = {
	name: string;
	classification: ExpenseClassification;
	frequency: ExpenseFrequency;
	customIntervalCount: number | null;
	customIntervalUnit: ExpenseIntervalUnit | null;
	amountKind: ExpenseAmountKind;
	amount: number;
	currencyCode: string;
	categoryId: string;
	statementDay: number | null;
	paymentDueDay: number | null;
};
