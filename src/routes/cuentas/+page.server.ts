import { fail, type Actions } from '@sveltejs/kit';
import {
	AccountNotFoundError,
	AccountValidationError,
	PersonalAccountDeleteError
} from '$lib/server/accounts/account.errors';
import { accountService } from '$lib/server/accounts/account.service';
import { buildAccountBalanceAdjustmentMovement } from '$lib/server/accounts/account-balance-adjustment';
import { bankService } from '$lib/server/banks/bank.service';
import { MovementValidationError } from '$lib/server/movements/movement.errors';
import { movementService } from '$lib/server/movements/movement.service';
import { colorInputToHex } from '$lib/shared/utils/color';

export async function load() {
	const [accounts, banks] = await Promise.all([
		accountService.getAccounts(),
		bankService.getBanks()
	]);

	return { accounts, banks };
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function amountCents(value: string) {
	const amount = Number(value);
	return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

function optionalAmountCents(value: string) {
	return value.trim().length > 0 ? amountCents(value) : null;
}

function optionalInteger(value: string) {
	if (value.trim().length === 0) return null;
	const parsed = Number(value);
	return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function formBoolean(formData: FormData, field: string) {
	return formData.get(field) === 'on' || formData.get(field) === 'true';
}

function accountValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		accountType: formValue(formData, 'accountType'),
		name: formValue(formData, 'name'),
		bankId: formValue(formData, 'bankId'),
		cardLastFourDigits: formValue(formData, 'cardLastFourDigits'),
		cardColor: formValue(formData, 'cardColor'),
		initialBalance: formValue(formData, 'initialBalance'),
		balanceAsOfDate: formValue(formData, 'balanceAsOfDate'),
		creditLimit: formValue(formData, 'creditLimit'),
		statementDay: formValue(formData, 'statementDay'),
		paymentDueDay: formValue(formData, 'paymentDueDay'),
		isActive: formBoolean(formData, 'isActive')
	};
}

function adjustValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		newBalance: formValue(formData, 'newBalance'),
		reason: formValue(formData, 'reason')
	};
}

function isValidIsoDate(value: string) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00`));
}

export const actions: Actions = {
	createAccount: async ({ request }) => {
		const values = accountValues(await request.formData());
		const errors: Record<string, string[]> = {};
		const initialBalanceCents = amountCents(values.initialBalance);
		const creditLimitCents = optionalAmountCents(values.creditLimit);
		const statementDay = optionalInteger(values.statementDay);
		const paymentDueDay = optionalInteger(values.paymentDueDay);
		if (!['debit', 'credit'].includes(values.accountType)) errors.accountType = ['Selecciona un tipo de cuenta válido.'];
		if (values.name.trim().length === 0) errors.name = ['El nombre es obligatorio.'];
		if (values.bankId.trim().length === 0) errors.bankId = ['Selecciona un banco.'];
		if (!isValidIsoDate(values.balanceAsOfDate)) errors.balanceAsOfDate = ['Captura una fecha de referencia válida.'];
		if (values.accountType === 'debit' && !/^\d{4}$/.test(values.cardLastFourDigits.trim())) errors.cardLastFourDigits = ['Captura exactamente 4 dígitos.'];
		if (!colorInputToHex(values.cardColor)) errors.cardColor = ['El color debe ser hexadecimal o rgb válido.'];
		if (!Number.isInteger(initialBalanceCents) || initialBalanceCents < 0) {
			errors.initialBalance = ['El saldo inicial no puede ser negativo.'];
		}
		if (values.accountType === 'credit') {
			if (!Number.isInteger(creditLimitCents) || creditLimitCents === null || creditLimitCents <= 0) {
				errors.creditLimit = ['El límite de crédito debe ser mayor a 0.'];
			}
			if (Number.isInteger(creditLimitCents) && Number.isInteger(initialBalanceCents) && creditLimitCents !== null && initialBalanceCents > creditLimitCents) {
				errors.initialBalance = ['El saldo no debe superar el límite de crédito.'];
			}
			if (!Number.isInteger(statementDay) || statementDay === null || statementDay < 1 || statementDay > 31) {
				errors.statementDay = ['El día de corte debe estar entre 1 y 31.'];
			}
			if (!Number.isInteger(paymentDueDay) || paymentDueDay === null || paymentDueDay < 1 || paymentDueDay > 31) {
				errors.paymentDueDay = ['El día límite de pago debe estar entre 1 y 31.'];
			}
		}
		if (Object.keys(errors).length > 0) return fail(400, { action: 'create-account' as const, errors, values });

		try {
			await accountService.createAccount({
				type: values.accountType as 'debit' | 'credit',
				name: values.name,
				bankId: values.bankId,
				cardLastFourDigits: values.cardLastFourDigits || null,
				cardColor: values.cardColor,
				initialBalanceCents,
				balanceAsOfDate: values.balanceAsOfDate,
				creditLimitCents: values.accountType === 'credit' ? creditLimitCents : null,
				statementDay: values.accountType === 'credit' ? statementDay : null,
				paymentDueDay: values.accountType === 'credit' ? paymentDueDay : null,
				isActive: values.accountType === 'credit' ? values.isActive : true
			});
			return { action: 'create-account' as const, success: 'Cuenta registrada.' };
		} catch (error) {
			if (error instanceof AccountValidationError) {
				return fail(400, { action: 'create-account' as const, errors: error.errors, values });
			}
			throw error;
		}
	},
	updateAccount: async ({ request }) => {
		const values = accountValues(await request.formData());
		const errors: Record<string, string[]> = {};
		const initialBalanceCents = amountCents(values.initialBalance);
		const creditLimitCents = optionalAmountCents(values.creditLimit);
		const statementDay = optionalInteger(values.statementDay);
		const paymentDueDay = optionalInteger(values.paymentDueDay);
		if (values.id.trim().length === 0) errors.id = ['La cuenta es obligatoria.'];
		if (values.name.trim().length === 0) errors.name = ['El nombre es obligatorio.'];
		if (values.accountType !== 'personal' && !isValidIsoDate(values.balanceAsOfDate)) {
			errors.balanceAsOfDate = ['Captura una fecha de referencia válida.'];
		}
		if (values.accountType === 'debit' && values.bankId && !/^\d{4}$/.test(values.cardLastFourDigits.trim())) errors.cardLastFourDigits = ['Captura exactamente 4 dígitos.'];
		if (values.bankId && !colorInputToHex(values.cardColor)) errors.cardColor = ['El color debe ser hexadecimal o rgb válido.'];
		if (values.accountType === 'credit') {
			if (!Number.isInteger(creditLimitCents) || creditLimitCents === null || creditLimitCents <= 0) {
				errors.creditLimit = ['El límite de crédito debe ser mayor a 0.'];
			}
			if (!Number.isInteger(statementDay) || statementDay === null || statementDay < 1 || statementDay > 31) {
				errors.statementDay = ['El día de corte debe estar entre 1 y 31.'];
			}
			if (!Number.isInteger(paymentDueDay) || paymentDueDay === null || paymentDueDay < 1 || paymentDueDay > 31) {
				errors.paymentDueDay = ['El día límite de pago debe estar entre 1 y 31.'];
			}
		}
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'update-account' as const, targetId: values.id, errors, values });
		}

		try {
			await accountService.updateAccount({
				id: values.id,
				name: values.name,
				bankId: values.bankId || null,
				cardLastFourDigits: values.cardLastFourDigits || null,
				cardColor: values.cardColor || null,
				balanceCents: null,
				balanceAsOfDate: values.accountType !== 'personal' ? values.balanceAsOfDate : null,
				creditLimitCents: values.accountType === 'credit' ? creditLimitCents : null,
				statementDay: values.accountType === 'credit' ? statementDay : null,
				paymentDueDay: values.accountType === 'credit' ? paymentDueDay : null,
				isActive: values.accountType === 'credit' ? values.isActive : null
			});
			return { action: 'update-account' as const, success: 'Cuenta actualizada.' };
		} catch (error) {
			if (error instanceof AccountValidationError) {
				return fail(400, { action: 'update-account' as const, targetId: values.id, errors: error.errors, values });
			}
			if (error instanceof AccountNotFoundError) {
				return fail(400, { action: 'update-account' as const, targetId: values.id, message: error.message, values });
			}
			throw error;
		}
	},
	toggleCreditAccountActive: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		const isActive = formBoolean(formData, 'isActive');
		if (id.length === 0) return fail(400, { action: 'toggle-credit-account-active' as const, targetId: id, message: 'La cuenta es obligatoria.' });

		try {
			await accountService.updateCreditAccountActive(id, isActive);
			return { action: 'toggle-credit-account-active' as const, success: isActive ? 'Tarjeta activada.' : 'Tarjeta desactivada.' };
		} catch (error) {
			if (error instanceof AccountValidationError || error instanceof AccountNotFoundError) {
				return fail(400, { action: 'toggle-credit-account-active' as const, targetId: id, message: error.message });
			}
			throw error;
		}
	},
	adjustAccountBalance: async ({ request }) => {
		const values = adjustValues(await request.formData());
		const errors: Record<string, string[]> = {};
		const newBalanceCents = amountCents(values.newBalance);
		if (values.id.trim().length === 0) errors.id = ['La cuenta es obligatoria.'];
		if (!Number.isInteger(newBalanceCents) || newBalanceCents < 0) {
			errors.newBalance = ['El nuevo saldo no puede ser negativo.'];
		}
		if (values.reason.trim().length === 0) errors.reason = ['El motivo es obligatorio.'];
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'adjust-account-balance' as const, targetId: values.id, errors, values });
		}

		try {
			const account = await accountService.getAccount(values.id);
			const adjustmentMovement = buildAccountBalanceAdjustmentMovement({
				account,
				newBalanceCents,
				reason: values.reason,
				occurredAt: new Date().toISOString()
			});
			if (!adjustmentMovement) {
				return fail(400, {
					action: 'adjust-account-balance' as const,
					targetId: values.id,
					errors: { newBalance: ['El nuevo saldo debe ser diferente al saldo actual.'] },
					values
				});
			}

			await movementService.createMovement(adjustmentMovement);
			return { action: 'adjust-account-balance' as const, success: 'Ajuste registrado como movimiento.' };
		} catch (error) {
			if (error instanceof MovementValidationError) {
				return fail(400, { action: 'adjust-account-balance' as const, targetId: values.id, errors: error.errors, values });
			}
			if (error instanceof AccountNotFoundError) {
				return fail(400, { action: 'adjust-account-balance' as const, targetId: values.id, message: error.message, values });
			}
			throw error;
		}
	},
	deleteAccount: async ({ request }) => {
		const id = formValue(await request.formData(), 'id').trim();
		if (id.length === 0) return fail(400, { action: 'delete-account' as const, targetId: id, message: 'La cuenta es obligatoria.' });

		try {
			await accountService.deleteAccount(id);
			return { action: 'delete-account' as const, success: 'Cuenta eliminada.' };
		} catch (error) {
			if (error instanceof AccountNotFoundError || error instanceof PersonalAccountDeleteError) {
				return fail(400, { action: 'delete-account' as const, targetId: id, message: error.message });
			}
			throw error;
		}
	}
};
