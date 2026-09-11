import type { IsoDateTime } from '$lib/shared/types/date.types';

export type FinancialGoal = {
	id: string;
	name: string;
	targetAmount: number;
	allocationPercentage: number;
	currencyCode: string;
	active: boolean;
	registeredAt: IsoDateTime;
	updatedAt: IsoDateTime | null;
	deletedAt: IsoDateTime | null;
};
