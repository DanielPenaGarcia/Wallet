import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import type { CreateFinancialGoalInput } from './inputs/create-financial-goal.input';
import type { UpdateFinancialGoalInput } from './inputs/update-financial-goal.input';

export interface FinancialGoalRepository {
	findById(id: string): Promise<FinancialGoal | undefined>;
	list(): Promise<FinancialGoal[]>;
	create(input: CreateFinancialGoalInput): Promise<FinancialGoal>;
	update(input: UpdateFinancialGoalInput): Promise<void>;
	delete(id: string): Promise<void>;
}
