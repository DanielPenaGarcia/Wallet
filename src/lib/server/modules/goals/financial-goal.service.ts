import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import { FinancialGoalNotFoundError, GoalAllocationExceededError } from './financial-goal.errors';
import { toFinancialGoal } from './financial-goal.mapper';
import {
	findActiveFinancialGoalById,
	getAllocatedPercentage,
	insertFinancialGoal,
	listActiveFinancialGoals,
	softDeleteFinancialGoalRecord,
	updateFinancialGoalRecord
} from './financial-goal.repository';
import type { CreateFinancialGoalInput } from './inputs/create-financial-goal.input';
import type { UpdateFinancialGoalInput } from './inputs/update-financial-goal.input';

async function ensureAllocationIsAvailable(
	allocationPercentage: number,
	excludedGoalId?: string
): Promise<void> {
	const allocatedPercentage = await getAllocatedPercentage(excludedGoalId);
	const availablePercentage = 100 - allocatedPercentage;
	if (allocationPercentage > availablePercentage) {
		throw new GoalAllocationExceededError(availablePercentage);
	}
}

export async function getFinancialGoals(): Promise<FinancialGoal[]> {
	return (await listActiveFinancialGoals()).map(toFinancialGoal);
}

export async function createFinancialGoal(input: CreateFinancialGoalInput): Promise<void> {
	await ensureAllocationIsAvailable(input.allocationPercentage);
	await insertFinancialGoal(input);
}

export async function updateFinancialGoal(input: UpdateFinancialGoalInput): Promise<void> {
	if (!(await findActiveFinancialGoalById(input.id))) throw new FinancialGoalNotFoundError();
	await ensureAllocationIsAvailable(input.allocationPercentage, input.id);
	await updateFinancialGoalRecord(input);
}

export async function deleteFinancialGoal(id: string): Promise<void> {
	if (!(await findActiveFinancialGoalById(id))) throw new FinancialGoalNotFoundError();
	await softDeleteFinancialGoalRecord(id);
}
