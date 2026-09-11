import type { FinancialGoal } from '../../types/financial-goal.types';
import type { GoalFormFeedback } from '../../types/goal-form-feedback.types';

export type FinancialGoalFormProps = {
	mode: 'create' | 'edit';
	goal?: FinancialGoal;
	feedback?: GoalFormFeedback | null;
	onCancel?: () => void;
};
