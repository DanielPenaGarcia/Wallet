import { getStatementOutstandingAmount } from '$lib/modules/credit-card-statements/utils/credit-card-statement-calculations';
import { drizzleAccountRepository } from '$lib/server/accounts/drizzle-account.repository';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import { drizzleCreditCardStatementRepository } from './drizzle-credit-card-statement.repository';
import {
	CreditCardStatementNotFoundError,
	CreditCardStatementValidationError
} from './credit-card-statement.errors';
import type { CreditCardStatementRepository } from './credit-card-statement.repository';
import type { CreateCreditCardStatementInput } from './inputs/create-credit-card-statement.input';
import type { UpdateCreditCardStatementInput } from './inputs/update-credit-card-statement.input';

export class CreditCardStatementService {
	constructor(
		private readonly statementRepository: CreditCardStatementRepository,
		private readonly accountRepository: AccountRepository
	) {}

	async getLatestStatement(accountId: string) {
		await this.assertCreditAccount(accountId);
		return this.statementRepository.findLatestByAccountId(accountId);
	}

	async getStatementHistory(accountId: string) {
		await this.assertCreditAccount(accountId);
		return this.statementRepository.listByAccountId(accountId);
	}

	async createHistoricalStatement(input: CreateCreditCardStatementInput) {
		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		const duplicate = await this.statementRepository.findByAccountIdAndStatementDate(
			normalizedInput.accountId,
			normalizedInput.statementDate
		);
		if (duplicate) {
			throw new CreditCardStatementValidationError({
				statementDate: ['Ya existe un corte registrado para esta fecha.']
			});
		}

		return this.statementRepository.create(normalizedInput);
	}

	async updateHistoricalStatement(input: UpdateCreditCardStatementInput) {
		const statement = await this.statementRepository.findById(input.id);
		if (!statement) throw new CreditCardStatementNotFoundError();

		const normalizedInput = this.normalizeInput(input);
		if (statement.accountId !== normalizedInput.accountId) throw new CreditCardStatementNotFoundError();
		await this.assertValidInput(normalizedInput);
		const duplicate = await this.statementRepository.findByAccountIdAndStatementDate(
			normalizedInput.accountId,
			normalizedInput.statementDate
		);
		if (duplicate && duplicate.id !== input.id) {
			throw new CreditCardStatementValidationError({
				statementDate: ['Ya existe un corte registrado para esta fecha.']
			});
		}

		await this.statementRepository.update(normalizedInput);
	}

	private normalizeInput<T extends CreateCreditCardStatementInput | UpdateCreditCardStatementInput>(input: T): T {
		return {
			...input,
			accountId: input.accountId.trim(),
			periodStartDate: input.periodStartDate.trim(),
			periodEndDate: input.periodEndDate.trim(),
			statementDate: input.statementDate.trim(),
			paymentDueDate: input.paymentDueDate.trim()
		};
	}

	private async assertValidInput(input: CreateCreditCardStatementInput) {
		const errors: Record<string, string[]> = {};

		if (input.accountId.length === 0) errors.accountId = ['La tarjeta es obligatoria.'];
		else await this.assertCreditAccount(input.accountId, errors);
		if (!this.isIsoDate(input.periodStartDate)) errors.periodStartDate = ['El inicio del periodo debe ser válido.'];
		if (!this.isIsoDate(input.periodEndDate)) errors.periodEndDate = ['El fin del periodo debe ser válido.'];
		if (!this.isIsoDate(input.statementDate)) errors.statementDate = ['La fecha de corte debe ser válida.'];
		if (!this.isIsoDate(input.paymentDueDate)) errors.paymentDueDate = ['La fecha límite debe ser válida.'];
		if (
			this.isIsoDate(input.periodStartDate) &&
			this.isIsoDate(input.periodEndDate) &&
			input.periodStartDate > input.periodEndDate
		) {
			errors.periodStartDate = ['El inicio del periodo no puede ser posterior al fin.'];
		}
		if (
			this.isIsoDate(input.statementDate) &&
			this.isIsoDate(input.paymentDueDate) &&
			input.paymentDueDate <= input.statementDate
		) {
			errors.paymentDueDate = ['La fecha límite debe ser posterior al corte.'];
		}
		if (!Number.isInteger(input.statementBalanceCents) || input.statementBalanceCents < 0) {
			errors.statementBalance = ['El saldo al corte no puede ser negativo.'];
		}
		if (!Number.isInteger(input.paidAmountCents) || input.paidAmountCents < 0) {
			errors.paidAmount = ['El monto pagado no puede ser negativo.'];
		}
		if (
			Number.isInteger(input.statementBalanceCents) &&
			Number.isInteger(input.paidAmountCents) &&
			input.paidAmountCents > input.statementBalanceCents
		) {
			errors.paidAmount = ['El monto pagado no puede superar el saldo al corte.'];
		}
		if (Object.keys(errors).length === 0 && getStatementOutstandingAmount(input) < 0) {
			errors.paidAmount = ['El pendiente del corte no puede ser negativo.'];
		}

		if (Object.keys(errors).length > 0) throw new CreditCardStatementValidationError(errors);
	}

	private async assertCreditAccount(accountId: string, errors?: Record<string, string[]>) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) {
			if (errors) errors.accountId = ['La tarjeta no existe.'];
			else throw new CreditCardStatementValidationError({ accountId: ['La tarjeta no existe.'] });
			return;
		}
		if (account.type !== 'credit') {
			if (errors) errors.accountId = ['La cuenta debe ser una tarjeta de crédito.'];
			else throw new CreditCardStatementValidationError({ accountId: ['La cuenta debe ser una tarjeta de crédito.'] });
		}
	}

	private isIsoDate(value: string) {
		const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!match) return false;

		const year = Number(match[1]);
		const month = Number(match[2]);
		const day = Number(match[3]);
		const date = new Date(0);
		date.setUTCFullYear(year, month - 1, day);
		date.setUTCHours(0, 0, 0, 0);

		return (
			date.getUTCFullYear() === year &&
			date.getUTCMonth() === month - 1 &&
			date.getUTCDate() === day
		);
	}
}

export const creditCardStatementService = new CreditCardStatementService(
	drizzleCreditCardStatementRepository,
	drizzleAccountRepository
);
