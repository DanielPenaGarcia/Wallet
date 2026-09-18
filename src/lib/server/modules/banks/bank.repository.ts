import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { banks } from '$lib/server/db/schema';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

export async function findBankById(id: string) {
	return db.query.banks.findFirst({
		where: (bank, { eq }) => eq(bank.id, id)
	});
}

export async function listBanks() {
	return db.select({
		id: banks.id,
		name: banks.name,
		alias: banks.alias,
		color: banks.color
	}).from(banks).orderBy(asc(banks.name));
}

export async function insertBank(input: CreateBankInput) {
	const bank = {
		id: crypto.randomUUID(),
		name: input.name,
		alias: input.alias,
		color: input.color
	};

	await db.insert(banks).values(bank);
	return bank;
}

export async function updateBankRecord(input: UpdateBankInput): Promise<void> {
	await db.update(banks).set({
		name: input.name,
		alias: input.alias,
		color: input.color
	}).where(eq(banks.id, input.id));
}

export async function deleteBankRecord(id: string): Promise<void> {
	await db.delete(banks).where(eq(banks.id, id));
}
