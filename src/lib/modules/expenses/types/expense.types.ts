import type { CategoryColor } from '$lib/modules/categories/types/category.types';
import type { IsoDateTime } from '$lib/shared/types/date.types';

export const expenseClassifications = [
	'necessity',
	'discretionary',
	'gifts_social',
	'obligations',
	'savings_investment',
	'extraordinary'
] as const;

export const expenseFrequencies = [
	'one_time',
	'daily',
	'weekly',
	'semimonthly',
	'monthly',
	'yearly',
	'custom'
] as const;

export const expenseAmountKinds = ['fixed', 'estimated'] as const;
export const expenseIntervalUnits = ['days', 'weeks', 'months', 'years'] as const;

export type ExpenseClassification = (typeof expenseClassifications)[number];
export type ExpenseFrequency = (typeof expenseFrequencies)[number];
export type ExpenseAmountKind = (typeof expenseAmountKinds)[number];
export type ExpenseIntervalUnit = (typeof expenseIntervalUnits)[number];

export type Expense = {
	id: string;
	name: string;
	classification: ExpenseClassification;
	frequency: ExpenseFrequency;
	customIntervalCount: number | null;
	customIntervalUnit: ExpenseIntervalUnit | null;
	amountKind: ExpenseAmountKind;
	amount: number;
	currencyCode: string;
	statementDay: number | null;
	paymentDueDay: number | null;
	categoryId: string;
	categoryName: string;
	categoryColor: CategoryColor;
	active: boolean;
	registeredAt: IsoDateTime;
	updatedAt: IsoDateTime | null;
	deletedAt: IsoDateTime | null;
	amountHistory: ExpenseAmountChange[];
	paymentHistory: ExpensePayment[];
};

export type ExpenseAmountChangeDirection = 'initial' | 'increase' | 'decrease';

export type ExpenseAmountChange = {
	id: string;
	previousAmount: number | null;
	newAmount: number;
	direction: ExpenseAmountChangeDirection;
	changedAt: IsoDateTime;
};

export type ExpensePaymentMode = 'paid' | 'card';

export type ExpensePayment = {
	id: string;
	expenseId: string;
	mode: ExpensePaymentMode;
	amount: number;
	currencyCode: string;
	note: string | null;
	cardId: string | null;
	cardAlias: string | null;
	cardLastFourDigits: string | null;
	movementId: string | null;
	paidAt: IsoDateTime;
	registeredAt: IsoDateTime;
};
