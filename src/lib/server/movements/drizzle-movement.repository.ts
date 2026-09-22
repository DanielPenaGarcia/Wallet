import { and, desc, eq, gte, lte, or } from 'drizzle-orm';
import { db, type Database } from '$lib/server/db';
import { accounts, movements } from '$lib/server/db/schema';
import type { MovementRepository } from './movement.repository';
import type { AccountBalanceChangeInput } from './inputs/account-balance-change.input';
import type { CreateMovementInput } from './inputs/create-movement.input';
import type { ListMovementsInput } from './inputs/list-movements.input';
import type { RecurringMaterializationInput } from './inputs/recurring-materialization.input';
import type { UpdateMovementInput } from './inputs/update-movement.input';
import { toMovementOutput } from './movement.mapper';

export class DrizzleMovementRepository implements MovementRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const [movement] = await this.database.select().from(movements).where(eq(movements.id, id)).limit(1);
		return movement ? toMovementOutput(movement) : undefined;
	}

	async findActiveRecurringMaterialization(input: RecurringMaterializationInput) {
		const recurringFilter = input.recurringExpenseId
			? eq(movements.recurringExpenseId, input.recurringExpenseId)
			: input.recurringIncomeId
				? eq(movements.recurringIncomeId, input.recurringIncomeId)
				: undefined;
		if (!recurringFilter) return undefined;

		const rows = await this.database
			.select()
			.from(movements)
			.where(and(
				eq(movements.active, true),
				eq(movements.type, input.type),
				recurringFilter
			));
		const duplicate = rows.find((movement) =>
			movement.id !== input.excludeMovementId &&
			movement.occurredAt.slice(0, 10) === input.occurredOn
		);

		return duplicate ? toMovementOutput(duplicate) : undefined;
	}

	async list(input: ListMovementsInput = {}) {
		const filters = [];
		if (!input.includeDeleted) filters.push(eq(movements.active, true));
		if (input.accountId) {
			filters.push(or(
				eq(movements.sourceAccountId, input.accountId),
				eq(movements.destinationAccountId, input.accountId)
			));
		}
		if (input.categoryId) filters.push(eq(movements.categoryId, input.categoryId));
		if (input.type) filters.push(eq(movements.type, input.type));
		if (input.startDate) filters.push(gte(movements.occurredAt, input.startDate));
		if (input.endDate) filters.push(lte(movements.occurredAt, input.endDate));

		const query = this.database
			.select()
			.from(movements)
			.where(filters.length > 0 ? and(...filters) : undefined)
			.orderBy(desc(movements.occurredAt), desc(movements.createdAt));
		const rows = input.limit && input.limit > 0
			? await query.limit(input.limit)
			: await query;

		return rows.map(toMovementOutput);
	}

	async createWithBalanceChanges(input: CreateMovementInput, balanceChanges: AccountBalanceChangeInput[]) {
		const now = new Date().toISOString();
		const movement = {
			id: crypto.randomUUID(),
			type: input.type,
			title: input.title,
			description: input.description,
			amountCents: input.amountCents,
			currencyCode: input.currencyCode,
			occurredAt: input.occurredAt,
			sourceAccountId: input.sourceAccountId,
			destinationAccountId: input.destinationAccountId,
			categoryId: input.categoryId,
			recurringExpenseId: input.recurringExpenseId,
			recurringIncomeId: input.recurringIncomeId,
			active: true,
			createdAt: now,
			updatedAt: now,
			deletedAt: null
		};

		this.database.transaction((tx) => {
			tx.insert(movements).values(movement).run();

			for (const change of balanceChanges) {
				tx
					.update(accounts)
					.set({
						balanceCents: change.newBalanceCents,
						updatedAt: now
					})
					.where(eq(accounts.id, change.accountId))
					.run();
			}
		});

		return toMovementOutput(movement);
	}

	async updateWithBalanceChanges(input: UpdateMovementInput, balanceChanges: AccountBalanceChangeInput[]) {
		const now = new Date().toISOString();

		this.database.transaction((tx) => {
			tx
				.update(movements)
				.set({
					type: input.type,
					title: input.title,
					description: input.description,
					amountCents: input.amountCents,
					currencyCode: input.currencyCode,
					occurredAt: input.occurredAt,
					sourceAccountId: input.sourceAccountId,
					destinationAccountId: input.destinationAccountId,
					categoryId: input.categoryId,
					recurringExpenseId: input.recurringExpenseId,
					recurringIncomeId: input.recurringIncomeId,
					updatedAt: now
				})
				.where(eq(movements.id, input.id))
				.run();

			this.applyBalanceChanges(tx, balanceChanges, now);
		});

		const updated = await this.findById(input.id);
		if (!updated) throw new Error('No se pudo leer el movimiento actualizado.');
		return updated;
	}

	async softDeleteWithBalanceChanges(id: string, balanceChanges: AccountBalanceChangeInput[]) {
		const now = new Date().toISOString();

		this.database.transaction((tx) => {
			tx
				.update(movements)
				.set({
					active: false,
					updatedAt: now,
					deletedAt: now
				})
				.where(eq(movements.id, id))
				.run();

			this.applyBalanceChanges(tx, balanceChanges, now);
		});
	}

	private applyBalanceChanges(
		tx: Parameters<Parameters<Database['transaction']>[0]>[0],
		balanceChanges: AccountBalanceChangeInput[],
		updatedAt: string
	) {
		for (const change of balanceChanges) {
			tx
				.update(accounts)
				.set({
					balanceCents: change.newBalanceCents,
					updatedAt
				})
				.where(eq(accounts.id, change.accountId))
				.run();
		}
	}
}

export const drizzleMovementRepository = new DrizzleMovementRepository();
