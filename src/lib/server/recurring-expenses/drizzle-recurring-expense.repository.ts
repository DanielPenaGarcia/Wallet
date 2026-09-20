import { asc, desc, eq } from 'drizzle-orm';
import type { ExpenseAmountKind, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
import type {
	RecurringExpense,
	RecurringExpenseFrequency,
	RecurringExpensePaymentSchedule
} from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import { calculateNextRecurringExpenseOccurrence } from '$lib/modules/recurring-expenses/utils/next-recurring-expense-occurrence';
import { db, type Database } from '$lib/server/db';
import { categories, recurringExpenses } from '$lib/server/db/schema';
import type { CreateRecurringExpenseInput } from './inputs/create-recurring-expense.input';
import type { UpdateRecurringExpenseInput } from './inputs/update-recurring-expense.input';
import type { RecurringExpenseRepository } from './recurring-expense.repository';

type RecurringExpenseRow = typeof recurringExpenses.$inferSelect & {
	categoryName: string | null;
	categoryColor: string | null;
	categoryIsEssential: boolean | null;
};

class DrizzleRecurringExpenseRepository implements RecurringExpenseRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const [expense] = await this.database
			.select(this.selection())
			.from(recurringExpenses)
			.leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
			.where(eq(recurringExpenses.id, id))
			.limit(1);

		return expense ? this.toRecurringExpense(expense) : undefined;
	}

	async list() {
		const expenses = await this.database
			.select(this.selection())
			.from(recurringExpenses)
			.leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
			.orderBy(desc(recurringExpenses.isActive), asc(recurringExpenses.name));

		return expenses.map((expense) => this.toRecurringExpense(expense));
	}

	async create(input: CreateRecurringExpenseInput): Promise<RecurringExpense> {
		const now = new Date().toISOString();
		const expense = {
			id: crypto.randomUUID(),
			name: input.name,
			categoryId: input.categoryId,
			amountCents: input.amountCents,
			amountKind: input.amountKind,
			frequency: input.frequency,
			customIntervalCount: input.customIntervalCount,
			customIntervalUnit: input.customIntervalUnit,
			paymentSchedule: JSON.stringify(input.paymentSchedule),
			statementDay: input.statementDay,
			lastPaidAt: input.lastPaidAt,
			isActive: input.isActive,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(recurringExpenses).values(expense);
		const created = await this.findById(expense.id);
		if (!created) throw new Error('No se pudo leer el gasto recurrente creado.');
		return created;
	}

	async update(input: UpdateRecurringExpenseInput): Promise<void> {
		await this.database
			.update(recurringExpenses)
			.set({
				name: input.name,
				categoryId: input.categoryId,
				amountCents: input.amountCents,
				amountKind: input.amountKind,
				frequency: input.frequency,
				customIntervalCount: input.customIntervalCount,
				customIntervalUnit: input.customIntervalUnit,
				paymentSchedule: JSON.stringify(input.paymentSchedule),
				statementDay: input.statementDay,
				lastPaidAt: input.lastPaidAt,
				isActive: input.isActive,
				updatedAt: new Date().toISOString()
			})
			.where(eq(recurringExpenses.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
	}

	private selection() {
		return {
			id: recurringExpenses.id,
			name: recurringExpenses.name,
			categoryId: recurringExpenses.categoryId,
			amountCents: recurringExpenses.amountCents,
			amountKind: recurringExpenses.amountKind,
			frequency: recurringExpenses.frequency,
			customIntervalCount: recurringExpenses.customIntervalCount,
			customIntervalUnit: recurringExpenses.customIntervalUnit,
			paymentSchedule: recurringExpenses.paymentSchedule,
			statementDay: recurringExpenses.statementDay,
			lastPaidAt: recurringExpenses.lastPaidAt,
			isActive: recurringExpenses.isActive,
			createdAt: recurringExpenses.createdAt,
			updatedAt: recurringExpenses.updatedAt,
			categoryName: categories.name,
			categoryColor: categories.color,
			categoryIsEssential: categories.isEssential
		};
	}

	private toRecurringExpense(expense: RecurringExpenseRow): RecurringExpense {
		const mapped = {
			id: expense.id,
			name: expense.name,
			categoryId: expense.categoryId,
			category: expense.categoryName
				? {
						id: expense.categoryId,
						name: expense.categoryName,
						color: expense.categoryColor as `#${string}` | null,
						isEssential: Boolean(expense.categoryIsEssential)
					}
				: null,
			amountCents: expense.amountCents,
			amountKind: expense.amountKind as ExpenseAmountKind,
			frequency: expense.frequency as RecurringExpenseFrequency,
			customIntervalCount: expense.customIntervalCount,
			customIntervalUnit: expense.customIntervalUnit as ExpenseIntervalUnit | null,
			paymentSchedule: JSON.parse(expense.paymentSchedule) as RecurringExpensePaymentSchedule,
			statementDay: expense.statementDay,
			lastPaidAt: expense.lastPaidAt,
			nextOccurrenceAt: null,
			isActive: expense.isActive,
			createdAt: expense.createdAt,
			updatedAt: expense.updatedAt
		};

		return {
			...mapped,
			nextOccurrenceAt: calculateNextRecurringExpenseOccurrence(mapped)
		};
	}
}

export const drizzleRecurringExpenseRepository = new DrizzleRecurringExpenseRepository();
