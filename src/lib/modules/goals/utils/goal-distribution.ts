import type { FinancialGoal } from '../types/financial-goal.types';

type GoalDistributionInput = Pick<FinancialGoal, 'id' | 'status' | 'distributionPercentage'>;

export function sumActiveGoalDistribution(goals: GoalDistributionInput[], ignoredGoalId?: string) {
	return goals
		.filter((goal) => goal.status === 'active' && goal.id !== ignoredGoalId)
		.reduce((total, goal) => total + goal.distributionPercentage, 0);
}

export function availableGoalDistribution(goals: GoalDistributionInput[], ignoredGoalId?: string) {
	return Math.max(0, 100 - sumActiveGoalDistribution(goals, ignoredGoalId));
}
