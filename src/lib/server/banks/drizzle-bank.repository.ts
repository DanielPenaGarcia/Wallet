import { asc, eq } from 'drizzle-orm';
import { db, type Database } from '$lib/server/db';
import { accounts, banks } from '$lib/server/db/schema';
import type { BankRepository } from './bank.repository';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

class DrizzleBankRepository implements BankRepository {
	constructor(private readonly database: Database = db) {}

	findById(id: string) {
		return this.database.query.banks.findFirst({
			where: (bank, { eq }) => eq(bank.id, id)
		});
	}

	async hasAccounts(id: string) {
		const [account] = await this.database
			.select({ id: accounts.id })
			.from(accounts)
			.where(eq(accounts.bankId, id))
			.limit(1);

		return Boolean(account);
	}

	list() {
		return this.database.select({
			id: banks.id,
			name: banks.name,
			alias: banks.alias,
			color: banks.color
		}).from(banks).orderBy(asc(banks.name));
	}

	async create(input: CreateBankInput) {
		const bank = {
			id: crypto.randomUUID(),
			name: input.name,
			alias: input.alias,
			color: input.color
		};

		await this.database.insert(banks).values(bank);
		return bank;
	}

	async update(input: UpdateBankInput): Promise<void> {
		await this.database.update(banks).set({
			name: input.name,
			alias: input.alias,
			color: input.color
		}).where(eq(banks.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(banks).where(eq(banks.id, id));
	}
}

export const drizzleBankRepository = new DrizzleBankRepository();
