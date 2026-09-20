import type { FinancialGoal } from '../../types/financial-goal.types';
import type { GoalFormFeedback } from '../../types/goal-form-feedback.types';
import type { FinancialPlanningPeriod } from '../../types/goal-projection.types';

export type FinancialGoalFormProps = {
	mode: 'create' | 'edit';
	goal?: FinancialGoal;
	availableDistributionPercentage: number;
	planningPeriods: FinancialPlanningPeriod[];
	feedback?: GoalFormFeedback | null;
	onCancel?: () => void;
};
