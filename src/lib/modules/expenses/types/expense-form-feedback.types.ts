import type {
	ExpenseAmountKind,
	ExpenseClassification,
	ExpenseFrequency,
	ExpenseIntervalUnit
} from './expense.types';

export type ExpenseFormValues = {
	name: string;
	classification: ExpenseClassification;
	frequency: ExpenseFrequency;
	customIntervalCount: string;
	customIntervalUnit: ExpenseIntervalUnit | '';
	amountKind: ExpenseAmountKind;
	amount: string;
	currencyCode: string;
	categoryId: string;
	statementDay: string;
	paymentDueDay: string;
};

export type PayExpenseFormValues = {
	expenseId: string;
	mode: 'paid' | 'card';
	amount: string;
	paidAt: string;
	note: string;
	cardId: string;
};

export type ExpenseFormFeedback = {
	action: 'create-expense' | 'update-expense' | 'delete-expense' | 'pay-expense';
	success?: string;
	message?: string;
	errors?: Record<string, string[] | undefined>;
	targetId?: string;
	values?: Partial<ExpenseFormValues & PayExpenseFormValues>;
};
