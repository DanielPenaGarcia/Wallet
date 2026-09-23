import type {
	ExpenseAmountKind,
	ExpenseFrequency,
	ExpenseIntervalUnit
} from '$lib/modules/expenses/types/expense.types';
import type { Account, AccountType } from '$lib/modules/accounts/types/account.types';
import type { Category } from '$lib/modules/categories/types/category.types';

export const recurringExpenseFrequencies = [
	'daily',
	'weekly',
	'semimonthly',
	'monthly',
	'yearly',
	'custom'
] as const satisfies readonly ExpenseFrequency[];

export type RecurringExpenseFrequency = (typeof recurringExpenseFrequencies)[number];

export const weekDays = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const;

export type WeekDay = (typeof weekDays)[number];

export type MonthDay = number | 'last';

export type RecurringExpensePaymentSchedule =
	| { type: 'daily' }
	| { type: 'weekly'; weekday: WeekDay }
	| { type: 'semimonthly'; firstDay: number; secondDay: MonthDay }
	| { type: 'monthly'; day: MonthDay }
	| { type: 'yearly'; month: number; day: MonthDay }
	| { type: 'custom' };

export type RecurringExpenseCategory = Pick<Category, 'id' | 'name' | 'color' | 'isEssential'>;
export type RecurringExpensePaymentAccount = Pick<
	Account,
	'id' | 'name' | 'type' | 'bank' | 'cardLastFourDigits' | 'cardColor' | 'isActive'
>;

export type RecurringExpense = {
	id: string;
	name: string;
	categoryId: string;
	category: RecurringExpenseCategory | null;
	paymentAccountId: string | null;
	paymentAccount: RecurringExpensePaymentAccount | null;
	amountCents: number;
	amountKind: ExpenseAmountKind;
	frequency: RecurringExpenseFrequency;
	customIntervalCount: number | null;
	customIntervalUnit: ExpenseIntervalUnit | null;
	paymentSchedule: RecurringExpensePaymentSchedule;
	statementDay: number | null;
	lastPaidAt: string | null;
	nextOccurrenceAt: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type RecurringExpensePaymentAccountType = Extract<AccountType, 'debit' | 'credit'> | 'unassigned';

export type RecurringExpensesByPaymentAccountType = Record<
	RecurringExpensePaymentAccountType,
	RecurringExpense[]
>;
