import { asc, desc, eq } from 'drizzle-orm';
import type {
	IncomeFrequency,
	IncomeSource,
	PaymentSchedule,
	RecurringIncome,
	WorkSchedule
} from '$lib/modules/recurring-incomes/types/recurring-income.types';
import { db, type Database } from '$lib/server/db';
import { recurringIncomes } from '$lib/server/db/schema';
import type { CreateRecurringIncomeInput } from './inputs/create-recurring-income.input';
import type { UpdateRecurringIncomeInput } from './inputs/update-recurring-income.input';
import type { RecurringIncomeRepository } from './recurring-income.repository';

class DrizzleRecurringIncomeRepository implements RecurringIncomeRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const income = await this.database.query.recurringIncomes.findFirst({
			where: (recurringIncome, { eq }) => eq(recurringIncome.id, id)
		});

		return income ? this.toRecurringIncome(income) : undefined;
	}

	async list() {
		const incomes = await this.database.select().from(recurringIncomes).orderBy(
			desc(recurringIncomes.isActive),
			asc(recurringIncomes.title)
		);

		return incomes.map((income) => this.toRecurringIncome(income));
	}

	async create(input: CreateRecurringIncomeInput): Promise<RecurringIncome> {
		const now = new Date().toISOString();
		const income = {
			id: crypto.randomUUID(),
			title: input.title,
			expectedAmountCents: input.expectedAmountCents,
			source: input.source,
			frequency: input.frequency,
			paymentSchedule: JSON.stringify(input.paymentSchedule),
			workSchedule: input.workSchedule ? JSON.stringify(input.workSchedule) : null,
			isActive: input.isActive,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(recurringIncomes).values(income);
		return this.toRecurringIncome(income);
	}

	async update(input: UpdateRecurringIncomeInput): Promise<void> {
		await this.database.update(recurringIncomes).set({
			title: input.title,
			expectedAmountCents: input.expectedAmountCents,
			source: input.source,
			frequency: input.frequency,
			paymentSchedule: JSON.stringify(input.paymentSchedule),
			workSchedule: input.workSchedule ? JSON.stringify(input.workSchedule) : null,
			isActive: input.isActive,
			updatedAt: new Date().toISOString()
		}).where(eq(recurringIncomes.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(recurringIncomes).where(eq(recurringIncomes.id, id));
	}

	private toRecurringIncome(income: typeof recurringIncomes.$inferSelect): RecurringIncome {
		return {
			id: income.id,
			title: income.title,
			expectedAmountCents: income.expectedAmountCents,
			source: income.source as IncomeSource,
			frequency: income.frequency as IncomeFrequency,
			paymentSchedule: JSON.parse(income.paymentSchedule) as PaymentSchedule,
			workSchedule: income.workSchedule ? JSON.parse(income.workSchedule) as WorkSchedule : null,
			isActive: income.isActive,
			createdAt: income.createdAt,
			updatedAt: income.updatedAt
		};
	}
}

export const drizzleRecurringIncomeRepository = new DrizzleRecurringIncomeRepository();
