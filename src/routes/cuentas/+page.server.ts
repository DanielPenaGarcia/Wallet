import { fail, type Actions } from '@sveltejs/kit';
import {
	AccountNotFoundError,
	AccountValidationError,
	PersonalAccountDeleteError
} from '$lib/server/accounts/account.errors';
import { accountService } from '$lib/server/accounts/account.service';
import { bankService } from '$lib/server/banks/bank.service';

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

function accountValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		name: formValue(formData, 'name'),
		bankId: formValue(formData, 'bankId'),
		initialBalance: formValue(formData, 'initialBalance')
	};
}

function adjustValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		newBalance: formValue(formData, 'newBalance'),
		reason: formValue(formData, 'reason')
	};
}

export const actions: Actions = {
	createAccount: async ({ request }) => {
		const values = accountValues(await request.formData());
		const errors: Record<string, string[]> = {};
		const initialBalanceCents = amountCents(values.initialBalance);
		if (values.name.trim().length === 0) errors.name = ['El nombre es obligatorio.'];
		if (values.bankId.trim().length === 0) errors.bankId = ['Selecciona un banco.'];
		if (!Number.isInteger(initialBalanceCents) || initialBalanceCents < 0) {
			errors.initialBalance = ['El saldo inicial no puede ser negativo.'];
		}
		if (Object.keys(errors).length > 0) return fail(400, { action: 'create-account' as const, errors, values });

		try {
			await accountService.createDebitAccount({
				name: values.name,
				bankId: values.bankId,
				initialBalanceCents
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
		if (values.id.trim().length === 0) errors.id = ['La cuenta es obligatoria.'];
		if (values.name.trim().length === 0) errors.name = ['El nombre es obligatorio.'];
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'update-account' as const, targetId: values.id, errors, values });
		}

		try {
			await accountService.updateAccount({
				id: values.id,
				name: values.name,
				bankId: values.bankId || null
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
			await accountService.adjustBalance({
				id: values.id,
				newBalanceCents,
				reason: values.reason
			});
			return { action: 'adjust-account-balance' as const, success: 'Saldo ajustado.' };
		} catch (error) {
			if (error instanceof AccountValidationError) {
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
