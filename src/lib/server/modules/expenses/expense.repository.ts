import { and, asc, desc, eq, inArray, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { cards, categories, expenseAmountChanges, expensePayments, expenses, movements } from '$lib/server/db/schema';
import type { CreateExpenseInput } from './inputs/create-expense.input';
import type { PayExpenseInput } from './inputs/pay-expense.input';
import type { UpdateExpenseInput } from './inputs/update-expense.input';

export async function insertExpense(input: CreateExpenseInput) {
	const now = new Date().toISOString();
	const expenseId = crypto.randomUUID();
	db.transaction((transaction) => {
		transaction.insert(expenses).values({
			id: expenseId,
			...input,
			active: true,
			registeredAt: now,
			updatedAt: null,
			deletedAt: null
		}).run();
		transaction.insert(expenseAmountChanges).values({
			id: crypto.randomUUID(),
			expenseId,
			previousAmount: null,
			newAmount: input.amount,
			direction: 'initial',
			changedAt: now
		}).run();
	});
}

export async function findActiveExpenseById(id: string) {
	return db.query.expenses.findFirst({
		where: (expense, { and, eq }) => and(eq(expense.id, id), eq(expense.active, true))
	});
}

export async function updateExpenseRecord(input: UpdateExpenseInput, previousAmount: number) {
	const changedAt = new Date().toISOString();
	db.transaction((transaction) => {
		transaction.update(expenses).set({
			name: input.name,
			classification: input.classification,
			frequency: input.frequency,
			customIntervalCount: input.customIntervalCount,
			customIntervalUnit: input.customIntervalUnit,
			amountKind: input.amountKind,
			amount: input.amount,
			currencyCode: input.currencyCode,
			categoryId: input.categoryId,
			statementDay: input.statementDay,
			paymentDueDay: input.paymentDueDay,
			updatedAt: changedAt
		}).where(eq(expenses.id, input.id)).run();

		if (input.amount !== previousAmount) {
			transaction.insert(expenseAmountChanges).values({
				id: crypto.randomUUID(),
				expenseId: input.id,
				previousAmount,
				newAmount: input.amount,
				direction: input.amount > previousAmount ? 'increase' : 'decrease',
				changedAt
			}).run();
		}
	});
}

export async function softDeleteExpenseRecord(id: string) {
	const deletedAt = new Date().toISOString();
	await db
		.update(expenses)
		.set({ active: false, deletedAt, updatedAt: deletedAt })
		.where(eq(expenses.id, id));
}

export async function listActiveExpensesWithCategory() {
	return db
		.select({
			id: expenses.id,
			name: expenses.name,
			classification: expenses.classification,
			frequency: expenses.frequency,
			customIntervalCount: expenses.customIntervalCount,
			customIntervalUnit: expenses.customIntervalUnit,
			amountKind: expenses.amountKind,
			amount: expenses.amount,
			currencyCode: expenses.currencyCode,
			statementDay: expenses.statementDay,
			paymentDueDay: expenses.paymentDueDay,
			categoryId: expenses.categoryId,
			categoryName: categories.name,
			categoryColor: categories.color,
			active: expenses.active,
			registeredAt: expenses.registeredAt,
			updatedAt: expenses.updatedAt,
			deletedAt: expenses.deletedAt
		})
		.from(expenses)
		.innerJoin(categories, eq(expenses.categoryId, categories.id))
		.where(eq(expenses.active, true))
		.orderBy(asc(expenses.name));
}

export async function listAmountChangesByExpenseIds(expenseIds: string[]) {
	if (expenseIds.length === 0) return [];
	return db
		.select()
		.from(expenseAmountChanges)
		.where(inArray(expenseAmountChanges.expenseId, expenseIds))
		.orderBy(desc(expenseAmountChanges.changedAt));
}

export async function listPaymentsByExpenseIds(expenseIds: string[]) {
	if (expenseIds.length === 0) return [];
	return db
		.select({
			id: expensePayments.id,
			expenseId: expensePayments.expenseId,
			mode: expensePayments.mode,
			amount: expensePayments.amount,
			currencyCode: expensePayments.currencyCode,
			note: expensePayments.note,
			cardId: expensePayments.cardId,
			cardAlias: cards.alias,
			cardLastFourDigits: cards.lastFourDigits,
			movementId: expensePayments.movementId,
			paidAt: expensePayments.paidAt,
			registeredAt: expensePayments.registeredAt
		})
		.from(expensePayments)
		.leftJoin(cards, eq(expensePayments.cardId, cards.id))
		.leftJoin(movements, eq(expensePayments.movementId, movements.id))
		.where(
			and(
				inArray(expensePayments.expenseId, expenseIds),
				or(eq(expensePayments.mode, 'paid'), eq(movements.active, true))
			)
		)
		.orderBy(desc(expensePayments.paidAt));
}

export async function insertExpensePayment(
	input: PayExpenseInput & { currencyCode: string; movementId: string | null }
) {
	const registeredAt = new Date().toISOString();
	await db.insert(expensePayments).values({
		id: crypto.randomUUID(),
		expenseId: input.expenseId,
		mode: input.mode,
		amount: input.amount,
		currencyCode: input.currencyCode,
		note: input.note,
		cardId: input.cardId,
		movementId: input.movementId,
		paidAt: input.paidAt,
		registeredAt
	});
}

export async function deleteExpensePaymentsByMovementId(movementId: string): Promise<void> {
	await db.delete(expensePayments).where(eq(expensePayments.movementId, movementId));
}
