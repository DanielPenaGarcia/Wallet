import type { JobIncome } from '$lib/modules/incomes/types/job-income.types';

type JobIncomeRecord = {
	id: string;
	jobName: string;
	monthlyAmount: number;
	amountType: 'gross' | 'net';
	paymentFrequency: 'weekly' | 'semimonthly' | 'monthly';
	schedule: string | null;
	currencyCode: string;
	active: boolean;
	registeredAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
};

export function toJobIncome(record: JobIncomeRecord): JobIncome {
	return record;
}
