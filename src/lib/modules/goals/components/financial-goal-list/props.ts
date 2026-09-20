import type { FinancialGoal } from '../../types/financial-goal.types';
import type { FinancialPlanningPeriod } from '../../types/goal-projection.types';

export type FinancialGoalListProps = {
	goals: FinancialGoal[];
	planningPeriods: FinancialPlanningPeriod[];
	onCreate: () => void;
	onEdit: (goal: FinancialGoal) => void;
	onDelete: (goal: FinancialGoal) => void;
};
