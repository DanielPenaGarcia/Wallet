import type { IsoDateTime } from '$lib/shared/types/date.types';

export const goalTypes = ['purchase', 'emergency_fund', 'travel', 'savings', 'other'] as const;
export const goalStatuses = ['active', 'paused', 'completed', 'cancelled'] as const;
export const goalPriorities = ['high', 'medium', 'low'] as const;

export type GoalType = (typeof goalTypes)[number];
export type GoalStatus = (typeof goalStatuses)[number];
export type GoalPriority = (typeof goalPriorities)[number];

export type FinancialGoal = {
	id: string;
	name: string;
	targetAmountCents: number;
	currentAmountCents: number;
	distributionPercentage: number;
	currencyCode: string;
	priority: GoalPriority;
	status: GoalStatus;
	type: GoalType;
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
};
