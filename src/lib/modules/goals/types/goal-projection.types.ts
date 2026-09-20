export type FinancialPlanningPeriod = {
	date: string;
	incomeAmountCents: number;
	obligationAmountCents: number;
	freeAmountCents: number;
};

export type GoalProjection = {
	goalId: string;
	remainingAmountCents: number;
	estimatedNextContributionCents: number;
	estimatedRemainingPeriods: number | null;
	estimatedCompletionDate: string | null;
	unavailableReason: string | null;
};
