import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '$lib/server/db';
import { cards, categories, expenses, movements } from '$lib/server/db/schema';
import type { CreateMovementInput } from './inputs/create-movement.input';
import type { UpdateMovementInput } from './inputs/update-movement.input';

const sourceCards = alias(cards, 'source_cards');
const destinationCards = alias(cards, 'destination_cards');

export type MovementPeriodFilter = {
	startsAt?: string;
	endsAt?: string;
};

function movementValues(input: CreateMovementInput, currencyCode: string) {
	const isExpense = input.type === 'expense';
	const isInstallment = isExpense && input.paymentMode === 'installments';
	return {
		type: input.type,
		title: input.title,
		reason: input.type === 'income' ? (input.reason ?? null) : null,
		amount: input.amount,
		currencyCode,
		paymentMode: isExpense ? (input.paymentMode ?? 'cash') : null,
		installmentCount: isInstallment ? input.installmentCount : null,
		interestFree: isInstallment ? (input.interestFree ?? false) : false,
		occurredAt: input.occurredAt,
		sourceCardId: input.type === 'income' ? null : (input.sourceCardId ?? null),
		destinationCardId: input.type === 'expense' ? null : (input.destinationCardId ?? null),
		expenseId:
			isExpense && input.classificationKind === 'expense' ? (input.classificationId ?? null) : null,
		categoryId:
			isExpense && input.classificationKind === 'category' ? (input.classificationId ?? null) : null
	};
}

export async function listActiveMovements(period: MovementPeriodFilter = {}) {
	const conditions = [eq(movements.active, true)];
	if (period.startsAt) conditions.push(gte(movements.occurredAt, period.startsAt));
	if (period.endsAt) conditions.push(lte(movements.occurredAt, period.endsAt));

	return db
		.select({
			id: movements.id,
			type: movements.type,
			title: movements.title,
			reason: movements.reason,
			amount: movements.amount,
			currencyCode: movements.currencyCode,
			paymentMode: movements.paymentMode,
			installmentCount: movements.installmentCount,
			interestFree: movements.interestFree,
			occurredAt: movements.occurredAt,
			sourceCardId: movements.sourceCardId,
			sourceCardAlias: sourceCards.alias,
			sourceCardLastFourDigits: sourceCards.lastFourDigits,
			sourceCardKind: sourceCards.kind,
			destinationCardId: movements.destinationCardId,
			destinationCardAlias: destinationCards.alias,
			destinationCardLastFourDigits: destinationCards.lastFourDigits,
			destinationCardKind: destinationCards.kind,
			expenseId: movements.expenseId,
			expenseName: expenses.name,
			categoryId: movements.categoryId,
			categoryName: categories.name,
			active: movements.active,
			registeredAt: movements.registeredAt,
			updatedAt: movements.updatedAt,
			deletedAt: movements.deletedAt
		})
		.from(movements)
		.leftJoin(sourceCards, eq(movements.sourceCardId, sourceCards.id))
		.leftJoin(destinationCards, eq(movements.destinationCardId, destinationCards.id))
		.leftJoin(expenses, eq(movements.expenseId, expenses.id))
		.leftJoin(categories, eq(movements.categoryId, categories.id))
		.where(and(...conditions))
		.orderBy(desc(movements.occurredAt));
}

export async function listActiveMovementsForCards() {
	return db
		.select({
			id: movements.id,
			type: movements.type,
			title: movements.title,
			amount: movements.amount,
			paymentMode: movements.paymentMode,
			installmentCount: movements.installmentCount,
			interestFree: movements.interestFree,
			occurredAt: movements.occurredAt,
			sourceCardId: movements.sourceCardId,
			destinationCardId: movements.destinationCardId
		})
		.from(movements)
		.where(eq(movements.active, true));
}

export async function findActiveMovementById(id: string) {
	return db.query.movements.findFirst({
		where: (movement, { and, eq }) => and(eq(movement.id, id), eq(movement.active, true))
	});
}

export async function insertMovement(
	input: CreateMovementInput,
	currencyCode: string
): Promise<string> {
	const registeredAt = new Date().toISOString();
	const id = crypto.randomUUID();
	await db.insert(movements).values({
		id,
		...movementValues(input, currencyCode),
		active: true,
		registeredAt,
		updatedAt: null,
		deletedAt: null
	});
	return id;
}

export async function updateMovementRecord(
	input: UpdateMovementInput,
	currencyCode: string
): Promise<void> {
	await db
		.update(movements)
		.set({ ...movementValues(input, currencyCode), updatedAt: new Date().toISOString() })
		.where(eq(movements.id, input.id));
}

export async function softDeleteMovementRecord(id: string): Promise<void> {
	const deletedAt = new Date().toISOString();
	await db
		.update(movements)
		.set({ active: false, updatedAt: deletedAt, deletedAt })
		.where(eq(movements.id, id));
}
