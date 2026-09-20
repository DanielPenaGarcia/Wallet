import type { GoalPriority, GoalStatus, GoalType } from '$lib/modules/goals/types/financial-goal.types';

export type CreateFinancialGoalInput = {
	name: string;
	targetAmountCents: number;
	currentAmountCents: number;
	distributionPercentage: number;
	currencyCode: string;
	priority: GoalPriority;
	status: GoalStatus;
	type: GoalType;
};
