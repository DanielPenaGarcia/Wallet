import type { CreateFinancialGoalInput } from './create-financial-goal.input';

export type UpdateFinancialGoalInput = CreateFinancialGoalInput & {
	id: string;
};
