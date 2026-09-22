import { fail, type Actions } from '@sveltejs/kit';
import type { LoanDirection } from '$lib/modules/loans/types/loan.types';
import { toCardListItem } from '$lib/modules/accounts/utils/account-card-list-item';
import { accountService } from '$lib/server/accounts/account.service';
import { LoanValidationError } from '$lib/server/loans/loan.errors';
import { loanService } from '$lib/server/loans/loan.service';

export async function load() {
	const [loans, accounts] = await Promise.all([
		loanService.getLoans(),
		accountService.getAccounts()
	]);

	return {
		loans,
		cards: accounts.filter((account) => account.type !== 'credit').map(toCardListItem)
	};
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

function loanValues(formData: FormData) {
	return {
		name: formValue(formData, 'name'),
		direction: formValue(formData, 'direction') as LoanDirection,
		counterpartyName: formValue(formData, 'counterpartyName'),
		principalAmount: formValue(formData, 'principalAmount'),
		totalRepayment: formValue(formData, 'totalRepayment'),
		installmentCount: formValue(formData, 'installmentCount'),
		firstPaymentDate: formValue(formData, 'firstPaymentDate'),
		currencyCode: formValue(formData, 'currencyCode'),
		accountId: formValue(formData, 'accountId'),
		occurredAt: formValue(formData, 'occurredAt')
	};
}

export const actions: Actions = {
	createLoan: async ({ request }) => {
		const values = loanValues(await request.formData());
		try {
			await loanService.createLoan({
				name: values.name,
				direction: values.direction,
				counterpartyName: values.counterpartyName,
				principalAmountCents: amountCents(values.principalAmount),
				totalRepaymentCents: amountCents(values.totalRepayment),
				installmentCount: Number(values.installmentCount),
				firstPaymentDate: values.firstPaymentDate,
				currencyCode: values.currencyCode,
				accountId: values.accountId,
				occurredAt: dateTime(values.occurredAt)
			});
			return { action: 'create-loan' as const, success: 'Préstamo registrado.' };
		} catch (error) {
			if (error instanceof LoanValidationError) {
				return fail(400, {
					action: 'create-loan' as const,
					errors: error.errors,
					values
				});
			}
			throw error;
		}
	}
};
