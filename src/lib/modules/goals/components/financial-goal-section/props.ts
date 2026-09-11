import type { FinancialGoal } from '../../types/financial-goal.types';
import type { GoalFormFeedback } from '../../types/goal-form-feedback.types';

export type FinancialGoalSectionProps = {
	goals: FinancialGoal[];
	feedback?: GoalFormFeedback | null;
};
