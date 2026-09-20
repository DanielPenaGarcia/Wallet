import { asc, desc, eq, sql } from 'drizzle-orm';
import type { FinancialGoal, GoalPriority, GoalStatus, GoalType } from '$lib/modules/goals/types/financial-goal.types';
import { db, type Database } from '$lib/server/db';
import { financialGoals } from '$lib/server/db/schema';
import type { FinancialGoalRepository } from './financial-goal.repository';
import type { CreateFinancialGoalInput } from './inputs/create-financial-goal.input';
import type { UpdateFinancialGoalInput } from './inputs/update-financial-goal.input';

class DrizzleFinancialGoalRepository implements FinancialGoalRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const goal = await this.database.query.financialGoals.findFirst({
			where: (financialGoal, { eq }) => eq(financialGoal.id, id)
		});

		return goal ? this.toFinancialGoal(goal) : undefined;
	}

	async list() {
		const goals = await this.database
			.select()
			.from(financialGoals)
			.orderBy(
				sql`case ${financialGoals.status} when 'active' then 0 when 'paused' then 1 when 'completed' then 2 else 3 end`,
				sql`case ${financialGoals.priority} when 'high' then 0 when 'medium' then 1 else 2 end`,
				desc(financialGoals.distributionPercentage),
				asc(financialGoals.name)
			);

		return goals.map((goal) => this.toFinancialGoal(goal));
	}

	async create(input: CreateFinancialGoalInput) {
		const now = new Date().toISOString();
		const goal = {
			id: crypto.randomUUID(),
			name: input.name,
			targetAmountCents: input.targetAmountCents,
			currentAmountCents: input.currentAmountCents,
			distributionPercentage: input.distributionPercentage,
			currencyCode: input.currencyCode,
			priority: input.priority,
			status: input.status,
			type: input.type,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(financialGoals).values(goal);
		return this.toFinancialGoal(goal);
	}

	async update(input: UpdateFinancialGoalInput): Promise<void> {
		await this.database
			.update(financialGoals)
			.set({
				name: input.name,
				targetAmountCents: input.targetAmountCents,
				currentAmountCents: input.currentAmountCents,
				distributionPercentage: input.distributionPercentage,
				currencyCode: input.currencyCode,
				priority: input.priority,
				status: input.status,
				type: input.type,
				updatedAt: new Date().toISOString()
			})
			.where(eq(financialGoals.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(financialGoals).where(eq(financialGoals.id, id));
	}

	private toFinancialGoal(goal: typeof financialGoals.$inferSelect): FinancialGoal {
		return {
			id: goal.id,
			name: goal.name,
			targetAmountCents: goal.targetAmountCents,
			currentAmountCents: goal.currentAmountCents,
			distributionPercentage: goal.distributionPercentage,
			currencyCode: goal.currencyCode,
			priority: goal.priority as GoalPriority,
			status: goal.status as GoalStatus,
			type: goal.type as GoalType,
			createdAt: goal.createdAt,
			updatedAt: goal.updatedAt
		};
	}
}

export const drizzleFinancialGoalRepository = new DrizzleFinancialGoalRepository();
