import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { Bank } from '$lib/modules/banks/types/bank.types';
import { colorInputToHex } from '$lib/shared/utils/color';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import { BankNameAlreadyExistsError, BankNotFoundError } from './bank.errors';
import type { BankRepository } from './bank.repository';
import { drizzleBankRepository } from './drizzle-bank.repository';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

export class BankService {
	constructor(private readonly bankRepository: BankRepository) {}

	async getActiveBankOptions(): Promise<BankOption[]> {
		return (await this.bankRepository.list()).map(({ id, name, alias }) => ({ id, name, alias }));
	}

	getBanks(): Promise<Bank[]> {
		return this.bankRepository.list();
	}

	async createBank(input: CreateBankInput): Promise<void> {
		const normalizedInput = this.normalizeBankInput(input);
		await this.assertUniqueBankName(normalizedInput.name);
		await this.bankRepository.create(normalizedInput);
	}

	async updateBank(input: UpdateBankInput): Promise<void> {
		if (!(await this.bankRepository.findById(input.id))) throw new BankNotFoundError();

		const normalizedInput = this.normalizeBankInput(input);
		await this.assertUniqueBankName(normalizedInput.name, input.id);
		await this.bankRepository.update(normalizedInput);
	}

	async deleteBank(id: string): Promise<void> {
		if (!(await this.bankRepository.findById(id))) throw new BankNotFoundError();
		await this.bankRepository.delete(id);
	}

	private normalizeBankInput<T extends CreateBankInput>(input: T): T {
		const color = colorInputToHex(input.color);
		return {
			...input,
			name: input.name.trim(),
			alias: input.alias.trim(),
			color: color ?? input.color.trim()
		};
	}

	private async assertUniqueBankName(name: string, ignoredId?: string) {
		const normalizedName = normalizeName(name);
		const duplicated = (await this.bankRepository.list()).some(
			(bank) => bank.id !== ignoredId && normalizeName(bank.name) === normalizedName
		);
		if (duplicated) throw new BankNameAlreadyExistsError();
	}
}

export const bankService = new BankService(drizzleBankRepository);
