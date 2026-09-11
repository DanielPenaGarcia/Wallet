import type { MoneyInMinorUnits } from '$lib/modules/cards/types/card.types';
import type { IsoDateTime } from '$lib/shared/types/date.types';

export type IncomeAmountType = 'gross' | 'net';
export type IncomePaymentFrequency = 'weekly' | 'semimonthly' | 'monthly';

export type JobIncome = {
	id: string;
	jobName: string;
	monthlyAmount: MoneyInMinorUnits;
	amountType: IncomeAmountType;
	paymentFrequency: IncomePaymentFrequency;
	schedule: string | null;
	currencyCode: string;
	active: boolean;
	registeredAt: IsoDateTime;
	updatedAt: IsoDateTime | null;
	deletedAt: IsoDateTime | null;
};
