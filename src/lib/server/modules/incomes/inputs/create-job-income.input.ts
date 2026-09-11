import type {
	IncomeAmountType,
	IncomePaymentFrequency
} from '$lib/modules/incomes/types/job-income.types';

export type CreateJobIncomeInput = {
	jobName: string;
	monthlyAmount: number;
	amountType: IncomeAmountType;
	paymentFrequency: IncomePaymentFrequency;
	schedule: string | null;
	currencyCode: string;
};
