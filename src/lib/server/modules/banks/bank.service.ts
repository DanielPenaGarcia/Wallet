import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { Bank } from '$lib/modules/banks/types/bank.types';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import { BankHasCardsError, BankNameAlreadyExistsError, BankNotFoundError } from './bank.errors';
import {
	findActiveBankById,
	hasCardsForBank,
	insertBank,
	listActiveBankRecords,
	listActiveBanks,
	softDeleteBankRecord,
	updateBankRecord
} from './bank.repository';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

export async function getActiveBankOptions(): Promise<BankOption[]> {
	return listActiveBanks();
}

export async function getBanks(): Promise<Bank[]> {
	return listActiveBankRecords();
}

export async function createBank(input: CreateBankInput): Promise<void> {
	const normalizedName = normalizeName(input.name);
	const duplicated = (await listActiveBankRecords()).some(
		(bank) => normalizeName(bank.name) === normalizedName
	);
	if (duplicated) throw new BankNameAlreadyExistsError();
	await insertBank(input);
}

export async function updateBank(input: UpdateBankInput): Promise<void> {
	if (!(await findActiveBankById(input.id))) throw new BankNotFoundError();
	const normalizedName = normalizeName(input.name);
	const duplicated = (await listActiveBankRecords()).some(
		(bank) => bank.id !== input.id && normalizeName(bank.name) === normalizedName
	);
	if (duplicated) throw new BankNameAlreadyExistsError();
	await updateBankRecord(input);
}

export async function deleteBank(id: string): Promise<void> {
	if (!(await findActiveBankById(id))) throw new BankNotFoundError();
	if (await hasCardsForBank(id)) throw new BankHasCardsError();
	await softDeleteBankRecord(id);
}
