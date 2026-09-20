import { error, fail, type Actions } from '@sveltejs/kit';
import {
	AccountNotFoundError,
	AccountValidationError
} from '$lib/server/accounts/account.errors';
import { accountService } from '$lib/server/accounts/account.service';
import {
	InstallmentPurchaseNotFoundError,
	InstallmentPurchaseValidationError
} from '$lib/server/installment-purchases/installment-purchase.errors';
import { installmentPurchaseService } from '$lib/server/installment-purchases/installment-purchase.service';
import { getPaymentDueDate } from '$lib/modules/credit-card-statements/utils/credit-card-cycle';
import { getCreditCardProjection } from '$lib/modules/credit-card-statements/utils/credit-card-statement-calculations';
import {
	CreditCardStatementNotFoundError,
	CreditCardStatementValidationError
} from '$lib/server/credit-card-statements/credit-card-statement.errors';
import { creditCardStatementService } from '$lib/server/credit-card-statements/credit-card-statement.service';

export async function load({ params }) {
	try {
		const account = await accountService.getCreditAccount(params.id);
		const [purchases, statementHistory] = await Promise.all([
			installmentPurchaseService.getInstallmentPurchasesByAccountId(params.id),
			creditCardStatementService.getStatementHistory(params.id)
		]);
		const latestStatement = statementHistory[0];
		const normalizedLatestStatement = latestStatement ?? null;
		const projection = getCreditCardProjection({ account, purchases, latestStatement: normalizedLatestStatement });
		const statementDraft = {
			periodStartDate: projection.cycle.previousPeriodStart,
			periodEndDate: projection.cycle.previousPeriodEnd,
			statementDate: projection.cycle.previousStatementDate,
			paymentDueDate: getPaymentDueDate({
				statementDate: projection.cycle.previousStatementDate,
				paymentDueDay: account.paymentDueDay ?? 1
			})
		};

		return {
			account,
			purchases,
			statementHistory,
			latestStatement: normalizedLatestStatement,
			projection,
			statementDraft
		};
	} catch (caught) {
		if (caught instanceof AccountNotFoundError || caught instanceof AccountValidationError) {
			error(404, 'Tarjeta de crédito no encontrada.');
		}
		throw caught;
	}
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function amountCents(value: string) {
	const amount = Number(value);
	return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

function integerValue(value: string) {
	const parsed = Number(value);
	return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function purchaseValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		accountId: formValue(formData, 'accountId'),
		description: formValue(formData, 'description'),
		purchaseDate: formValue(formData, 'purchaseDate'),
		originalAmount: formValue(formData, 'originalAmount'),
		installmentAmount: formValue(formData, 'installmentAmount'),
		totalInstallments: formValue(formData, 'totalInstallments'),
		billedInstallments: formValue(formData, 'billedInstallments'),
		paidInstallments: formValue(formData, 'paidInstallments')
	};
}

function statementValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		accountId: formValue(formData, 'accountId'),
		periodStartDate: formValue(formData, 'periodStartDate'),
		periodEndDate: formValue(formData, 'periodEndDate'),
		statementDate: formValue(formData, 'statementDate'),
		paymentDueDate: formValue(formData, 'paymentDueDate'),
		statementBalance: formValue(formData, 'statementBalance'),
		paidAmount: formValue(formData, 'paidAmount')
	};
}

export const actions: Actions = {
	createCreditCardStatement: async ({ params, request }) => {
		const accountId = params.id ?? '';
		const values = statementValues(await request.formData());

		try {
			await creditCardStatementService.createHistoricalStatement({
				accountId,
				periodStartDate: values.periodStartDate,
				periodEndDate: values.periodEndDate,
				statementDate: values.statementDate,
				paymentDueDate: values.paymentDueDate,
				statementBalanceCents: amountCents(values.statementBalance),
				paidAmountCents: amountCents(values.paidAmount)
			});

			return { action: 'create-credit-card-statement' as const, success: 'Corte registrado.' };
		} catch (caught) {
			if (caught instanceof CreditCardStatementValidationError) {
				return fail(400, { action: 'create-credit-card-statement' as const, errors: caught.errors, values });
			}
			throw caught;
		}
	},
	updateCreditCardStatement: async ({ params, request }) => {
		const accountId = params.id ?? '';
		const values = statementValues(await request.formData());
		if (values.id.trim().length === 0) {
			return fail(400, {
				action: 'update-credit-card-statement' as const,
				targetId: values.id,
				errors: { id: ['El corte es obligatorio.'] },
				values
			});
		}

		try {
			await creditCardStatementService.updateHistoricalStatement({
				id: values.id,
				accountId,
				periodStartDate: values.periodStartDate,
				periodEndDate: values.periodEndDate,
				statementDate: values.statementDate,
				paymentDueDate: values.paymentDueDate,
				statementBalanceCents: amountCents(values.statementBalance),
				paidAmountCents: amountCents(values.paidAmount)
			});

			return { action: 'update-credit-card-statement' as const, success: 'Corte actualizado.' };
		} catch (caught) {
			if (caught instanceof CreditCardStatementValidationError) {
				return fail(400, {
					action: 'update-credit-card-statement' as const,
					targetId: values.id,
					errors: caught.errors,
					values
				});
			}
			if (caught instanceof CreditCardStatementNotFoundError) {
				return fail(400, {
					action: 'update-credit-card-statement' as const,
					targetId: values.id,
					message: caught.message,
					values
				});
			}
			throw caught;
		}
	},
	createInstallmentPurchase: async ({ params, request }) => {
		const accountId = params.id ?? '';
		const values = purchaseValues(await request.formData());

		try {
			await installmentPurchaseService.createHistoricalInstallmentPurchase({
				accountId,
				description: values.description,
				purchaseDate: values.purchaseDate,
				originalAmountCents: amountCents(values.originalAmount),
				installmentAmountCents: amountCents(values.installmentAmount),
				totalInstallments: integerValue(values.totalInstallments),
				billedInstallments: integerValue(values.billedInstallments),
				paidInstallments: integerValue(values.paidInstallments)
			});

			return { action: 'create-installment-purchase' as const, success: 'Compra MSI registrada.' };
		} catch (caught) {
			if (caught instanceof InstallmentPurchaseValidationError) {
				return fail(400, { action: 'create-installment-purchase' as const, errors: caught.errors, values });
			}
			throw caught;
		}
	},
	updateInstallmentPurchase: async ({ params, request }) => {
		const accountId = params.id ?? '';
		const values = purchaseValues(await request.formData());
		if (values.id.trim().length === 0) {
			return fail(400, {
				action: 'update-installment-purchase' as const,
				targetId: values.id,
				errors: { id: ['La compra MSI es obligatoria.'] },
				values
			});
		}

		try {
			await installmentPurchaseService.updateHistoricalInstallmentPurchase({
				id: values.id,
				accountId,
				description: values.description,
				purchaseDate: values.purchaseDate,
				originalAmountCents: amountCents(values.originalAmount),
				installmentAmountCents: amountCents(values.installmentAmount),
				totalInstallments: integerValue(values.totalInstallments),
				billedInstallments: integerValue(values.billedInstallments),
				paidInstallments: integerValue(values.paidInstallments)
			});

			return { action: 'update-installment-purchase' as const, success: 'Compra MSI actualizada.' };
		} catch (caught) {
			if (caught instanceof InstallmentPurchaseValidationError) {
				return fail(400, {
					action: 'update-installment-purchase' as const,
					targetId: values.id,
					errors: caught.errors,
					values
				});
			}
			if (caught instanceof InstallmentPurchaseNotFoundError) {
				return fail(400, {
					action: 'update-installment-purchase' as const,
					targetId: values.id,
					message: caught.message,
					values
				});
			}
			throw caught;
		}
	},
	deleteInstallmentPurchase: async ({ params, request }) => {
		const accountId = params.id ?? '';
		const id = formValue(await request.formData(), 'id').trim();
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-installment-purchase' as const,
				targetId: id,
				message: 'La compra MSI es obligatoria.'
			});
		}

		try {
			await installmentPurchaseService.deleteHistoricalInstallmentPurchase(id, accountId);

			return { action: 'delete-installment-purchase' as const, success: 'Compra MSI eliminada.' };
		} catch (caught) {
			if (caught instanceof InstallmentPurchaseNotFoundError || caught instanceof InstallmentPurchaseValidationError) {
				return fail(400, {
					action: 'delete-installment-purchase' as const,
					targetId: id,
					message: caught.message
				});
			}
			throw caught;
		}
	}
};
