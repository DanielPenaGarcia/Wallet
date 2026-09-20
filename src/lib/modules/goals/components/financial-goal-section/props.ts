import type { FinancialGoal } from '../../types/financial-goal.types';
import type { GoalFormFeedback } from '../../types/goal-form-feedback.types';
import type { FinancialPlanningPeriod } from '../../types/goal-projection.types';

export type FinancialGoalSectionProps = {
	goals: FinancialGoal[];
	planningPeriods?: FinancialPlanningPeriod[];
	feedback?: GoalFormFeedback | null;
};
