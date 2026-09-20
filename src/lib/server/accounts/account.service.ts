import { normalizeName } from '$lib/shared/utils/normalize-name';
import { drizzleBankRepository } from '$lib/server/banks/drizzle-bank.repository';
import type { BankRepository } from '$lib/server/banks/bank.repository';
import {
	AccountNotFoundError,
	AccountValidationError,
	PersonalAccountDeleteError
} from './account.errors';
import type { AccountRepository } from './account.repository';
import { drizzleAccountRepository } from './drizzle-account.repository';
import type { AdjustAccountBalanceInput } from './inputs/adjust-account-balance.input';
import type { CreateAccountInput } from './inputs/create-account.input';
import type { UpdateAccountInput } from './inputs/update-account.input';

export class AccountService {
	constructor(
		private readonly accountRepository: AccountRepository,
		private readonly bankRepository: BankRepository
	) {}

	async getAccounts() {
		await this.ensurePersonalAccount();
		return this.accountRepository.list();
	}

	async createDebitAccount(input: CreateAccountInput): Promise<void> {
		await this.ensurePersonalAccount();
		const normalizedInput = this.normalizeCreateInput(input);
		await this.assertValidDebitInput(normalizedInput);
		await this.assertUniqueAccountName(normalizedInput.name);
		await this.accountRepository.createDebit(normalizedInput);
	}

	async updateAccount(input: UpdateAccountInput): Promise<void> {
		const account = await this.accountRepository.findById(input.id);
		if (!account) throw new AccountNotFoundError();

		const normalizedInput = {
			...input,
			name: input.name.trim(),
			bankId: account.type === 'personal' ? null : input.bankId?.trim() || null
		};

		const errors: Record<string, string[]> = {};
		if (normalizedInput.name.length === 0) errors.name = ['El nombre es obligatorio.'];
		if (normalizedInput.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (account.type === 'debit') {
			if (!normalizedInput.bankId) errors.bankId = ['Selecciona un banco.'];
			else if (!(await this.bankRepository.findById(normalizedInput.bankId))) {
				errors.bankId = ['Selecciona un banco existente.'];
			}
		}
		if (Object.keys(errors).length > 0) throw new AccountValidationError(errors);

		await this.assertUniqueAccountName(normalizedInput.name, account.id);
		await this.accountRepository.update(normalizedInput);
	}

	async deleteAccount(id: string): Promise<void> {
		const account = await this.accountRepository.findById(id);
		if (!account) throw new AccountNotFoundError();
		if (account.type === 'personal') throw new PersonalAccountDeleteError();

		await this.accountRepository.delete(id);
	}

	async adjustBalance(input: AdjustAccountBalanceInput): Promise<void> {
		const account = await this.accountRepository.findById(input.id);
		if (!account) throw new AccountNotFoundError();

		const normalizedInput = {
			...input,
			reason: input.reason.trim()
		};
		const errors: Record<string, string[]> = {};
		if (!Number.isInteger(normalizedInput.newBalanceCents) || normalizedInput.newBalanceCents < 0) {
			errors.newBalance = ['El nuevo saldo no puede ser negativo.'];
		}
		if (normalizedInput.reason.length === 0) errors.reason = ['El motivo es obligatorio.'];
		if (normalizedInput.reason.length > 200) errors.reason = ['El motivo debe tener máximo 200 caracteres.'];
		if (Object.keys(errors).length > 0) throw new AccountValidationError(errors);

		await this.accountRepository.adjustBalance(normalizedInput);
	}

	private async ensurePersonalAccount() {
		if (!(await this.accountRepository.findPersonal())) {
			await this.accountRepository.createPersonal();
		}
	}

	private normalizeCreateInput(input: CreateAccountInput): CreateAccountInput {
		return {
			...input,
			name: input.name.trim(),
			bankId: input.bankId.trim()
		};
	}

	private async assertValidDebitInput(input: CreateAccountInput) {
		const errors: Record<string, string[]> = {};

		if (input.name.length === 0) errors.name = ['El nombre es obligatorio.'];
		if (input.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (input.bankId.length === 0 || !(await this.bankRepository.findById(input.bankId))) {
			errors.bankId = ['Selecciona un banco existente.'];
		}
		if (!Number.isInteger(input.initialBalanceCents) || input.initialBalanceCents < 0) {
			errors.initialBalance = ['El saldo inicial no puede ser negativo.'];
		}

		if (Object.keys(errors).length > 0) throw new AccountValidationError(errors);
	}

	private async assertUniqueAccountName(name: string, ignoredId?: string) {
		const normalizedName = normalizeName(name);
		const duplicated = (await this.accountRepository.list()).some(
			(account) => account.id !== ignoredId && normalizeName(account.name) === normalizedName
		);
		if (duplicated) throw new AccountValidationError({ name: ['Ya existe una cuenta con ese nombre.'] });
	}
}

export const accountService = new AccountService(drizzleAccountRepository, drizzleBankRepository);
