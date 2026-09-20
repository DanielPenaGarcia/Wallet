import { getInstallmentAmounts } from '$lib/modules/installment-purchases/utils/installment-purchase-calculations';
import { drizzleAccountRepository } from '$lib/server/accounts/drizzle-account.repository';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import { drizzleInstallmentPurchaseRepository } from './drizzle-installment-purchase.repository';
import type { CreateInstallmentPurchaseInput } from './inputs/create-installment-purchase.input';
import type { UpdateInstallmentPurchaseInput } from './inputs/update-installment-purchase.input';
import {
	InstallmentPurchaseNotFoundError,
	InstallmentPurchaseValidationError
} from './installment-purchase.errors';
import type { InstallmentPurchaseRepository } from './installment-purchase.repository';

type InstallmentPurchaseInput = CreateInstallmentPurchaseInput | UpdateInstallmentPurchaseInput;

export class InstallmentPurchaseService {
	constructor(
		private readonly installmentPurchaseRepository: InstallmentPurchaseRepository,
		private readonly accountRepository: AccountRepository
	) {}

	async getInstallmentPurchasesByAccountId(accountId: string) {
		await this.assertCreditAccount(accountId);
		return this.installmentPurchaseRepository.listByAccountId(accountId);
	}

	async createHistoricalInstallmentPurchase(input: CreateInstallmentPurchaseInput): Promise<void> {
		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		await this.installmentPurchaseRepository.create(normalizedInput);
	}

	async updateHistoricalInstallmentPurchase(input: UpdateInstallmentPurchaseInput): Promise<void> {
		const purchase = await this.installmentPurchaseRepository.findById(input.id);
		if (!purchase) throw new InstallmentPurchaseNotFoundError();

		const normalizedInput = this.normalizeInput(input);
		if (purchase.accountId !== normalizedInput.accountId) throw new InstallmentPurchaseNotFoundError();
		await this.assertValidInput(normalizedInput);
		await this.installmentPurchaseRepository.update(normalizedInput);
	}

	async deleteHistoricalInstallmentPurchase(id: string, accountId?: string): Promise<void> {
		const purchase = await this.installmentPurchaseRepository.findById(id);
		if (!purchase) throw new InstallmentPurchaseNotFoundError();
		if (accountId && purchase.accountId !== accountId) throw new InstallmentPurchaseNotFoundError();

		await this.assertCreditAccount(purchase.accountId);
		await this.installmentPurchaseRepository.delete(id);
	}

	private normalizeInput<T extends InstallmentPurchaseInput>(input: T): T {
		return {
			...input,
			accountId: input.accountId.trim(),
			description: input.description.trim(),
			purchaseDate: input.purchaseDate.trim()
		};
	}

	private async assertValidInput(input: InstallmentPurchaseInput) {
		const errors: Record<string, string[]> = {};

		if (input.accountId.length === 0) errors.accountId = ['La tarjeta es obligatoria.'];
		else await this.assertCreditAccount(input.accountId, errors);
		if (input.description.length === 0) errors.description = ['La descripción es obligatoria.'];
		if (input.description.length > 160) errors.description = ['La descripción debe tener máximo 160 caracteres.'];
		if (!this.isIsoDate(input.purchaseDate)) errors.purchaseDate = ['La fecha de compra debe ser válida.'];
		if (!Number.isInteger(input.originalAmountCents) || input.originalAmountCents <= 0) {
			errors.originalAmount = ['El monto original debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.installmentAmountCents) || input.installmentAmountCents <= 0) {
			errors.installmentAmount = ['La mensualidad debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.totalInstallments) || input.totalInstallments <= 0) {
			errors.totalInstallments = ['El total de mensualidades debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.billedInstallments) || input.billedInstallments < 0) {
			errors.billedInstallments = ['Las mensualidades cortadas no pueden ser negativas.'];
		}
		if (!Number.isInteger(input.paidInstallments) || input.paidInstallments < 0) {
			errors.paidInstallments = ['Las mensualidades pagadas no pueden ser negativas.'];
		}
		if (Number.isInteger(input.paidInstallments) && Number.isInteger(input.billedInstallments) && input.paidInstallments > input.billedInstallments) {
			errors.paidInstallments = ['Las mensualidades pagadas no pueden superar las cortadas.'];
		}
		if (Number.isInteger(input.billedInstallments) && Number.isInteger(input.totalInstallments) && input.billedInstallments > input.totalInstallments) {
			errors.billedInstallments = ['Las mensualidades cortadas no pueden superar el total.'];
		}
		if (
			Number.isInteger(input.originalAmountCents) &&
			Number.isInteger(input.installmentAmountCents) &&
			Number.isInteger(input.totalInstallments) &&
			input.totalInstallments > 0 &&
			input.installmentAmountCents * (input.totalInstallments - 1) >= input.originalAmountCents
		) {
			errors.installmentAmount = ['La mensualidad genera un último pago inválido.'];
		}
		if (Object.keys(errors).length === 0) {
			const amounts = getInstallmentAmounts(input);
			if (Object.values(amounts).some((amount) => amount < 0)) {
				errors.installmentAmount = ['Los cálculos MSI no pueden producir cantidades negativas.'];
			}
		}

		if (Object.keys(errors).length > 0) throw new InstallmentPurchaseValidationError(errors);
	}

	private async assertCreditAccount(accountId: string, errors?: Record<string, string[]>) {
		const account = await this.accountRepository.findById(accountId);
		if (!account) {
			if (errors) errors.accountId = ['La tarjeta no existe.'];
			else throw new InstallmentPurchaseValidationError({ accountId: ['La tarjeta no existe.'] });
			return;
		}
		if (account.type !== 'credit') {
			if (errors) errors.accountId = ['La cuenta debe ser una tarjeta de crédito.'];
			else throw new InstallmentPurchaseValidationError({ accountId: ['La cuenta debe ser una tarjeta de crédito.'] });
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

export const installmentPurchaseService = new InstallmentPurchaseService(
	drizzleInstallmentPurchaseRepository,
	drizzleAccountRepository
);
