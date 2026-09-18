import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { Bank } from '$lib/modules/banks/types/bank.types';
import { colorInputToHex } from '$lib/shared/utils/color';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import { BankNameAlreadyExistsError, BankNotFoundError } from './bank.errors';
import { deleteBankRecord, findBankById, insertBank, listBanks, updateBankRecord } from './bank.repository';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

export async function getActiveBankOptions(): Promise<BankOption[]> {
	return (await listBanks()).map(({ id, name, alias }) => ({ id, name, alias }));
}

export async function getBanks(): Promise<Bank[]> {
	return listBanks();
}

function normalizeBankInput<T extends CreateBankInput>(input: T): T {
	const color = colorInputToHex(input.color);
	return {
		...input,
		name: input.name.trim(),
		alias: input.alias.trim(),
		color: color ?? input.color.trim()
	};
}

async function assertUniqueBankName(name: string, ignoredId?: string) {
	const normalizedName = normalizeName(name);
	const duplicated = (await listBanks()).some(
		(bank) => bank.id !== ignoredId && normalizeName(bank.name) === normalizedName
	);
	if (duplicated) throw new BankNameAlreadyExistsError();
}

export async function createBank(input: CreateBankInput): Promise<void> {
	const normalizedInput = normalizeBankInput(input);
	await assertUniqueBankName(normalizedInput.name);
	await insertBank(normalizedInput);
}

export async function updateBank(input: UpdateBankInput): Promise<void> {
	if (!(await findBankById(input.id))) throw new BankNotFoundError();
	const normalizedInput = normalizeBankInput(input);
	await assertUniqueBankName(normalizedInput.name, input.id);
	await updateBankRecord(normalizedInput);
}

export async function deleteBank(id: string): Promise<void> {
	if (!(await findBankById(id))) throw new BankNotFoundError();
	await deleteBankRecord(id);
}
