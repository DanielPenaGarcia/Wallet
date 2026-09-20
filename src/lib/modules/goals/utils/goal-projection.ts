import type { FinancialGoal } from '../types/financial-goal.types';
import type { FinancialPlanningPeriod, GoalProjection } from '../types/goal-projection.types';

type GoalProjectionInput = Pick<
	FinancialGoal,
	'id' | 'targetAmountCents' | 'currentAmountCents' | 'distributionPercentage' | 'status'
>;

export function projectGoalCompletion(
	goal: GoalProjectionInput,
	periods: FinancialPlanningPeriod[],
	distributionPercentage = goal.distributionPercentage
): GoalProjection {
	const remainingAmountCents = Math.max(0, goal.targetAmountCents - goal.currentAmountCents);
	const activeDistributionPercentage = goal.status === 'active' ? distributionPercentage : 0;

	if (remainingAmountCents === 0) {
		return {
			goalId: goal.id,
			remainingAmountCents,
			estimatedNextContributionCents: 0,
			estimatedRemainingPeriods: 0,
			estimatedCompletionDate: periods[0]?.date ?? null,
			unavailableReason: null
		};
	}

	if (activeDistributionPercentage <= 0) {
		return unavailableProjection(goal.id, remainingAmountCents, 'La meta no tiene distribución activa.');
	}

	if (periods.length === 0) {
		return unavailableProjection(goal.id, remainingAmountCents, 'No hay ingresos futuros configurados.');
	}

	let projectedAmountCents = goal.currentAmountCents;
	let positiveContributionPeriods = 0;
	let estimatedNextContributionCents = 0;

	for (const period of periods) {
		const contributionCents = Math.max(0, Math.round(period.freeAmountCents * (activeDistributionPercentage / 100)));
		if (estimatedNextContributionCents === 0) estimatedNextContributionCents = contributionCents;
		if (contributionCents > 0) positiveContributionPeriods += 1;

		projectedAmountCents += contributionCents;
		if (projectedAmountCents >= goal.targetAmountCents) {
			return {
				goalId: goal.id,
				remainingAmountCents,
				estimatedNextContributionCents,
				estimatedRemainingPeriods: positiveContributionPeriods,
				estimatedCompletionDate: period.date,
				unavailableReason: null
			};
		}
	}

	return {
		goalId: goal.id,
		remainingAmountCents,
		estimatedNextContributionCents,
		estimatedRemainingPeriods: null,
		estimatedCompletionDate: null,
		unavailableReason: estimatedNextContributionCents > 0
			? 'La proyección disponible no alcanza el objetivo dentro del horizonte calculado.'
			: 'El dinero libre proyectado es 0.'
	};
}

function unavailableProjection(goalId: string, remainingAmountCents: number, unavailableReason: string): GoalProjection {
	return {
		goalId,
		remainingAmountCents,
		estimatedNextContributionCents: 0,
		estimatedRemainingPeriods: null,
		estimatedCompletionDate: null,
		unavailableReason
	};
}
