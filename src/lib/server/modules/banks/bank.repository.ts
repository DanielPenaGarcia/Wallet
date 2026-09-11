import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { banks, cards } from '$lib/server/db/schema';
import type { UpdateBankInput } from './inputs/update-bank.input';
import type { CreateBankInput } from './inputs/create-bank.input';

export async function findActiveBankById(id: string) {
	return db.query.banks.findFirst({
		where: (bank, { and, eq }) => and(eq(bank.id, id), eq(bank.active, true))
	});
}

export async function listActiveBanks() {
	return db.select({ id: banks.id, name: banks.name }).from(banks).where(eq(banks.active, true)).orderBy(asc(banks.name));
}

export async function listActiveBankRecords() {
	return db.select({
		id: banks.id,
		name: banks.name,
		shortName: banks.shortName,
		countryCode: banks.countryCode,
		active: banks.active,
		registeredAt: banks.registeredAt,
		timeZone: banks.timeZone
	}).from(banks).where(eq(banks.active, true)).orderBy(asc(banks.name));
}

export async function hasCardsForBank(bankId: string): Promise<boolean> {
	const record = await db.select({ id: cards.id }).from(cards).where(eq(cards.bankId, bankId)).limit(1);
	return record.length > 0;
}

export async function insertBank(input: CreateBankInput) {
	const bank = {
		id: crypto.randomUUID(),
		name: input.name,
		shortName: input.shortName || null,
		countryCode: input.countryCode,
		active: true,
		registeredAt: new Date().toISOString(),
		timeZone: input.timeZone,
		weekendDays: '[0,6]',
		holidays: '[]'
	};

	await db.insert(banks).values(bank);
	return bank;
}

export async function updateBankRecord(input: UpdateBankInput): Promise<void> {
	await db.update(banks).set({
		name: input.name,
		shortName: input.shortName || null,
		countryCode: input.countryCode,
		timeZone: input.timeZone
	}).where(eq(banks.id, input.id));
}

export async function softDeleteBankRecord(id: string): Promise<void> {
	await db.update(banks).set({ active: false }).where(eq(banks.id, id));
}
