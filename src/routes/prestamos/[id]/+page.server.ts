import { error, fail, type Actions } from '@sveltejs/kit';
import { toCardListItem } from '$lib/modules/accounts/utils/account-card-list-item';
import { accountService } from '$lib/server/accounts/account.service';
import { LoanNotFoundError, LoanValidationError } from '$lib/server/loans/loan.errors';
import { loanService } from '$lib/server/loans/loan.service';
import { movementService } from '$lib/server/movements/movement.service';

export async function load({ params }) {
	try {
		const [loan, accounts, movements] = await Promise.all([
			loanService.getLoan(params.id),
			accountService.getAccounts(),
			movementService.listMovements({ loanId: params.id, includeDeleted: true })
		]);
		const accountNames = new Map(accounts.map((account) => [account.id, account.type === 'personal' ? 'Efectivo' : account.name]));
		return {
			loan,
			cards: accounts.filter((account) => account.type !== 'credit').map(toCardListItem),
			movements: movements.map((movement) => ({
				id: movement.id,
				type: movement.type,
				title: movement.title,
				amountCents: movement.amountCents,
				currencyCode: movement.currencyCode,
				occurredAt: movement.occurredAt,
				accountLabel: movement.sourceAccountId
					? accountNames.get(movement.sourceAccountId) ?? null
					: movement.destinationAccountId
						? accountNames.get(movement.destinationAccountId) ?? null
						: null
			}))
		};
	} catch (caught) {
		if (caught instanceof LoanNotFoundError) throw error(404, caught.message);
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

function dateTime(value: string) {
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function settlementValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		accountId: formValue(formData, 'accountId'),
		amount: formValue(formData, 'amount'),
		occurredAt: formValue(formData, 'occurredAt'),
		description: formValue(formData, 'description')
	};
}

export const actions: Actions = {
	registerPayment: async ({ request }) => {
		const values = settlementValues(await request.formData());
		try {
			await loanService.registerPayment({
				id: values.id,
				accountId: values.accountId,
				amountCents: amountCents(values.amount),
				occurredAt: dateTime(values.occurredAt),
				description: values.description || null
			});
			return { action: 'register-payment' as const, success: 'Pago registrado.' };
		} catch (caught) {
			if (caught instanceof LoanValidationError) return fail(400, { action: 'register-payment' as const, errors: caught.errors, values });
			if (caught instanceof LoanNotFoundError) return fail(404, { action: 'register-payment' as const, message: caught.message, values });
			throw caught;
		}
	},
	registerCollection: async ({ request }) => {
		const values = settlementValues(await request.formData());
		try {
			await loanService.registerCollection({
				id: values.id,
				accountId: values.accountId,
				amountCents: amountCents(values.amount),
				occurredAt: dateTime(values.occurredAt),
				description: values.description || null
			});
			return { action: 'register-collection' as const, success: 'Cobro registrado.' };
		} catch (caught) {
			if (caught instanceof LoanValidationError) return fail(400, { action: 'register-collection' as const, errors: caught.errors, values });
			if (caught instanceof LoanNotFoundError) return fail(404, { action: 'register-collection' as const, message: caught.message, values });
			throw caught;
		}
	},
	cancelLoan: async ({ request }) => {
		const id = formValue(await request.formData(), 'id');
		try {
			await loanService.cancelLoan(id);
			return { action: 'cancel-loan' as const, success: 'Préstamo cancelado.' };
		} catch (caught) {
			if (caught instanceof LoanNotFoundError) return fail(404, { action: 'cancel-loan' as const, message: caught.message, targetId: id });
			throw caught;
		}
	}
};
