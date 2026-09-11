import type { FinancialGoal } from '../../types/financial-goal.types';

export type FinancialGoalListProps = {
	goals: FinancialGoal[];
	onCreate: () => void;
	onEdit: (goal: FinancialGoal) => void;
	onDelete: (goal: FinancialGoal) => void;
};
