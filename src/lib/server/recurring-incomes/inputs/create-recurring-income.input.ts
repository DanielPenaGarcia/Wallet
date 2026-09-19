import type {
	IncomeFrequency,
	IncomeSource,
	PaymentSchedule,
	WorkSchedule
} from '$lib/modules/recurring-incomes/types/recurring-income.types';

export type CreateRecurringIncomeInput = {
	title: string;
	expectedAmountCents: number;
	source: IncomeSource;
	frequency: IncomeFrequency;
	paymentSchedule: PaymentSchedule;
	workSchedule: WorkSchedule | null;
	isActive: boolean;
};
