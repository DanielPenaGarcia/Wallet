import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';

type FinancialGoalRecord = {
	id: string;
	name: string;
	targetAmount: number;
	allocationPercentage: number;
	currencyCode: string;
	active: boolean;
	registeredAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
};

export function toFinancialGoal(record: FinancialGoalRecord): FinancialGoal {
	return record;
}
