import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { financialGoals } from '$lib/server/db/schema';
import type { CreateFinancialGoalInput } from './inputs/create-financial-goal.input';
import type { UpdateFinancialGoalInput } from './inputs/update-financial-goal.input';

export async function listActiveFinancialGoals() {
	return db
		.select()
		.from(financialGoals)
		.where(eq(financialGoals.active, true))
		.orderBy(asc(financialGoals.name));
}

export async function findActiveFinancialGoalById(id: string) {
	return db.query.financialGoals.findFirst({
		where: (goal, { and, eq }) => and(eq(goal.id, id), eq(goal.active, true))
	});
}

export async function getAllocatedPercentage(excludedGoalId?: string): Promise<number> {
	const goals = await listActiveFinancialGoals();
	return goals
		.filter((goal) => goal.id !== excludedGoalId)
		.reduce((total, goal) => total + goal.allocationPercentage, 0);
}

export async function insertFinancialGoal(input: CreateFinancialGoalInput): Promise<void> {
	const now = new Date().toISOString();
	await db.insert(financialGoals).values({
		id: crypto.randomUUID(),
		...input,
		active: true,
		registeredAt: now,
		updatedAt: null,
		deletedAt: null
	});
}

export async function updateFinancialGoalRecord(input: UpdateFinancialGoalInput): Promise<void> {
	await db
		.update(financialGoals)
		.set({
			name: input.name,
			targetAmount: input.targetAmount,
			allocationPercentage: input.allocationPercentage,
			currencyCode: input.currencyCode,
			updatedAt: new Date().toISOString()
		})
		.where(eq(financialGoals.id, input.id));
}

export async function softDeleteFinancialGoalRecord(id: string): Promise<void> {
	const deletedAt = new Date().toISOString();
	await db
		.update(financialGoals)
		.set({ active: false, updatedAt: deletedAt, deletedAt })
		.where(eq(financialGoals.id, id));
}
