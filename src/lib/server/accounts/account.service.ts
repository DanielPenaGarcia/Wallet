import { normalizeName } from '$lib/shared/utils/normalize-name';
import { drizzleBankRepository } from '$lib/server/banks/drizzle-bank.repository';
import type { BankRepository } from '$lib/server/banks/bank.repository';
import { colorInputToHex } from '$lib/shared/utils/color';
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

	async createAccount(input: CreateAccountInput): Promise<void> {
		await this.ensurePersonalAccount();
		const normalizedInput = this.normalizeCreateInput(input);
		await this.assertValidCreateInput(normalizedInput);
		await this.assertUniqueAccountName(normalizedInput.name);
		await this.accountRepository.create(normalizedInput);
	}

	async updateAccount(input: UpdateAccountInput): Promise<void> {
		const account = await this.accountRepository.findById(input.id);
		if (!account) throw new AccountNotFoundError();

		const normalizedInput = {
			...input,
			name: input.name.trim(),
			bankId: account.type === 'personal' ? null : input.bankId?.trim() || null,
			cardLastFourDigits: account.type === 'personal' ? null : input.cardLastFourDigits?.trim() || null,
			cardColor: account.type === 'personal' ? null : colorInputToHex(input.cardColor ?? '') ?? null,
			balanceCents: account.type === 'credit' ? input.balanceCents : account.balanceCents,
			creditLimitCents: account.type === 'credit' ? input.creditLimitCents : null,
			statementDay: account.type === 'credit' ? input.statementDay : null,
			paymentDueDay: account.type === 'credit' ? input.paymentDueDay : null,
			isActive: account.type === 'credit' ? input.isActive : true
		};

		const errors: Record<string, string[]> = {};
		if (normalizedInput.name.length === 0) errors.name = ['El nombre es obligatorio.'];
		if (normalizedInput.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (account.type === 'debit' || account.type === 'credit') {
			if (!normalizedInput.bankId) errors.bankId = ['Selecciona un banco.'];
			else if (!(await this.bankRepository.findById(normalizedInput.bankId))) {
				errors.bankId = ['Selecciona un banco existente.'];
			}
			if (account.type === 'debit' && (!normalizedInput.cardLastFourDigits || !/^\d{4}$/.test(normalizedInput.cardLastFourDigits))) {
				errors.cardLastFourDigits = ['Captura exactamente 4 dígitos.'];
			}
			if (!normalizedInput.cardColor) errors.cardColor = ['El color debe ser hexadecimal o rgb válido.'];
		}
		if (account.type === 'credit') {
			this.validateCreditConfiguration(normalizedInput, errors);
		}
		if (Object.keys(errors).length > 0) throw new AccountValidationError(errors);

		await this.assertUniqueAccountName(normalizedInput.name, account.id);
		await this.accountRepository.update(normalizedInput);
	}

	async updateCreditAccountActive(id: string, isActive: boolean): Promise<void> {
		const account = await this.accountRepository.findById(id);
		if (!account) throw new AccountNotFoundError();
		if (account.type !== 'credit') {
			throw new AccountValidationError({ id: ['Solo las tarjetas de crédito pueden activarse o desactivarse.'] });
		}

		await this.accountRepository.updateActive(id, isActive);
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
		if (account.type === 'credit') {
			throw new AccountValidationError({ id: ['El saldo de una tarjeta de crédito se edita desde su configuración básica.'] });
		}

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
			bankId: input.bankId.trim(),
			cardLastFourDigits: input.cardLastFourDigits?.trim() || null,
			cardColor: colorInputToHex(input.cardColor) ?? input.cardColor.trim()
		};
	}

	private async assertValidCreateInput(input: CreateAccountInput) {
		const errors: Record<string, string[]> = {};

		if (!['debit', 'credit'].includes(input.type)) errors.accountType = ['Selecciona un tipo de cuenta válido.'];
		if (input.name.length === 0) errors.name = ['El nombre es obligatorio.'];
		if (input.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (input.bankId.length === 0 || !(await this.bankRepository.findById(input.bankId))) {
			errors.bankId = ['Selecciona un banco existente.'];
		}
		if (input.type === 'debit' && (!input.cardLastFourDigits || !/^\d{4}$/.test(input.cardLastFourDigits))) {
			errors.cardLastFourDigits = ['Captura exactamente 4 dígitos.'];
		}
		if (!colorInputToHex(input.cardColor)) errors.cardColor = ['El color debe ser hexadecimal o rgb válido.'];
		if (!Number.isInteger(input.initialBalanceCents) || input.initialBalanceCents < 0) {
			errors.initialBalance = ['El saldo inicial no puede ser negativo.'];
		}
		if (input.type === 'debit') {
			if (input.creditLimitCents !== null) errors.creditLimit = ['Las cuentas de débito no tienen límite de crédito.'];
		}
		if (input.type === 'credit') {
			this.validateCreditConfiguration({
				balanceCents: input.initialBalanceCents,
				creditLimitCents: input.creditLimitCents,
				statementDay: input.statementDay,
				paymentDueDay: input.paymentDueDay
			}, errors);
		}

		if (Object.keys(errors).length > 0) throw new AccountValidationError(errors);
	}

	private validateCreditConfiguration(
		input: Pick<UpdateAccountInput, 'balanceCents' | 'creditLimitCents' | 'statementDay' | 'paymentDueDay'>,
		errors: Record<string, string[]>
	) {
		if (!Number.isInteger(input.creditLimitCents) || !input.creditLimitCents || input.creditLimitCents <= 0) {
			errors.creditLimit = ['El límite de crédito debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.balanceCents) || input.balanceCents === null || input.balanceCents < 0) {
			errors.initialBalance = ['El saldo no puede ser negativo.'];
		}
		if (
			Number.isInteger(input.creditLimitCents) &&
			Number.isInteger(input.balanceCents) &&
			input.creditLimitCents !== null &&
			input.balanceCents !== null &&
			input.balanceCents > input.creditLimitCents
		) {
			errors.initialBalance = ['El saldo no debe superar el límite de crédito.'];
		}
		if (!this.isValidRecurringMonthDay(input.statementDay)) {
			errors.statementDay = ['El día de corte debe estar entre 1 y 31.'];
		}
		if (!this.isValidRecurringMonthDay(input.paymentDueDay)) {
			errors.paymentDueDay = ['El día límite de pago debe estar entre 1 y 31.'];
		}
	}

	private isValidRecurringMonthDay(day: number | null) {
		return Number.isInteger(day) && day !== null && day >= 1 && day <= 31;
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
