import { asc, desc, eq } from 'drizzle-orm';
import type { Account, AccountAdjustment, AccountType } from '$lib/modules/accounts/types/account.types';
import { db, type Database } from '$lib/server/db';
import { accountAdjustments, accounts, banks } from '$lib/server/db/schema';
import type { AccountRepository } from './account.repository';
import type { CreateAccountInput } from './inputs/create-account.input';
import type { UpdateAccountInput } from './inputs/update-account.input';

type AccountRow = typeof accounts.$inferSelect & {
	bankName: string | null;
	bankAlias: string | null;
	bankColor: string | null;
};

export class DrizzleAccountRepository implements AccountRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const account = await this.findAccountRow(id);
		return account ? this.toAccount(account, await this.listAdjustmentsByAccountId(id)) : undefined;
	}

	async findPersonal() {
		const [account] = await this.accountSelection().where(eq(accounts.type, 'personal')).limit(1);
		return account ? this.toAccount(account, await this.listAdjustmentsByAccountId(account.id)) : undefined;
	}

	async list() {
		const accountRows = await this.accountSelection().orderBy(
			asc(accounts.type),
			asc(accounts.name)
		);
		const adjustments = await this.database
			.select()
			.from(accountAdjustments)
			.orderBy(desc(accountAdjustments.createdAt));
		const adjustmentsByAccount = new Map<string, AccountAdjustment[]>();
		for (const adjustment of adjustments) {
			const mapped = this.toAdjustment(adjustment);
			adjustmentsByAccount.set(mapped.accountId, [...(adjustmentsByAccount.get(mapped.accountId) ?? []), mapped]);
		}

		return accountRows.map((account) => this.toAccount(account, adjustmentsByAccount.get(account.id) ?? []));
	}

	async createPersonal() {
		const now = new Date().toISOString();
		const account = {
			id: crypto.randomUUID(),
			name: 'Efectivo',
			type: 'personal',
			bankId: null,
			cardLastFourDigits: null,
			cardColor: null,
			balanceCents: 0,
			balanceAsOfDate: now.slice(0, 10),
			creditLimitCents: null,
			statementDay: null,
			paymentDueDay: null,
			isActive: true,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(accounts).values(account);
		return this.toAccount({ ...account, bankName: null, bankAlias: null, bankColor: null }, []);
	}

	async create(input: CreateAccountInput) {
		const now = new Date().toISOString();
		const account = {
			id: crypto.randomUUID(),
			name: input.name,
			type: input.type,
			bankId: input.bankId,
			cardLastFourDigits: input.cardLastFourDigits,
			cardColor: input.cardColor,
			balanceCents: input.initialBalanceCents,
			balanceAsOfDate: input.balanceAsOfDate,
			creditLimitCents: input.creditLimitCents,
			statementDay: input.statementDay,
			paymentDueDay: input.paymentDueDay,
			isActive: input.isActive,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(accounts).values(account);
		const created = await this.findById(account.id);
		if (!created) throw new Error('No se pudo leer la cuenta creada.');
		return created;
	}

	async update(input: UpdateAccountInput) {
		await this.database
			.update(accounts)
			.set({
				name: input.name,
				bankId: input.bankId,
				cardLastFourDigits: input.cardLastFourDigits,
				cardColor: input.cardColor,
				balanceCents: input.balanceCents ?? undefined,
				balanceAsOfDate: input.balanceAsOfDate ?? undefined,
				creditLimitCents: input.creditLimitCents,
				statementDay: input.statementDay,
				paymentDueDay: input.paymentDueDay,
				isActive: input.isActive ?? undefined,
				updatedAt: new Date().toISOString()
			})
			.where(eq(accounts.id, input.id));
	}

	async updateActive(id: string, isActive: boolean) {
		await this.database
			.update(accounts)
			.set({
				isActive,
				updatedAt: new Date().toISOString()
			})
			.where(eq(accounts.id, id));
	}

	async delete(id: string) {
		await this.database.delete(accounts).where(eq(accounts.id, id));
	}

	private accountSelection() {
		return this.database
			.select({
				id: accounts.id,
				name: accounts.name,
				type: accounts.type,
				bankId: accounts.bankId,
				cardLastFourDigits: accounts.cardLastFourDigits,
				cardColor: accounts.cardColor,
				balanceCents: accounts.balanceCents,
				balanceAsOfDate: accounts.balanceAsOfDate,
				creditLimitCents: accounts.creditLimitCents,
				statementDay: accounts.statementDay,
				paymentDueDay: accounts.paymentDueDay,
				isActive: accounts.isActive,
				createdAt: accounts.createdAt,
				updatedAt: accounts.updatedAt,
				bankName: banks.name,
				bankAlias: banks.alias,
				bankColor: banks.color
			})
			.from(accounts)
			.leftJoin(banks, eq(accounts.bankId, banks.id));
	}

	private async findAccountRow(id: string) {
		const [account] = await this.accountSelection().where(eq(accounts.id, id)).limit(1);
		return account;
	}

	private listAdjustmentsByAccountId(accountId: string) {
		return this.database
			.select()
			.from(accountAdjustments)
			.where(eq(accountAdjustments.accountId, accountId))
			.orderBy(desc(accountAdjustments.createdAt))
			.then((adjustments) => adjustments.map((adjustment) => this.toAdjustment(adjustment)));
	}

	private toAccount(account: AccountRow, adjustments: AccountAdjustment[]): Account {
		return {
			id: account.id,
			name: account.name,
			type: account.type as AccountType,
			bankId: account.bankId,
			bank: account.bankId && account.bankName && account.bankAlias && account.bankColor
				? { id: account.bankId, name: account.bankName, alias: account.bankAlias, color: account.bankColor }
				: null,
			cardLastFourDigits: account.cardLastFourDigits,
			cardColor: account.cardColor,
			balanceCents: account.balanceCents,
			balanceAsOfDate: account.balanceAsOfDate,
			creditLimitCents: account.creditLimitCents,
			statementDay: account.statementDay,
			paymentDueDay: account.paymentDueDay,
			isActive: account.isActive,
			createdAt: account.createdAt,
			updatedAt: account.updatedAt,
			adjustments
		};
	}

	private toAdjustment(adjustment: typeof accountAdjustments.$inferSelect): AccountAdjustment {
		return {
			id: adjustment.id,
			accountId: adjustment.accountId,
			previousBalanceCents: adjustment.previousBalanceCents,
			newBalanceCents: adjustment.newBalanceCents,
			differenceCents: adjustment.differenceCents,
			reason: adjustment.reason,
			createdAt: adjustment.createdAt
		};
	}
}

export const drizzleAccountRepository = new DrizzleAccountRepository();
