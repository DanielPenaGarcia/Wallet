import { fail } from '@sveltejs/kit';
import { createCardSchema } from '$lib/modules/cards/schemas/create-card.schema';
import { deleteCardSchema } from '$lib/modules/cards/schemas/delete-card.schema';
import { payCreditInstallmentSchema } from '$lib/modules/cards/schemas/pay-credit-installment.schema';
import { updateCardSchema } from '$lib/modules/cards/schemas/update-card.schema';
import type { CardKind } from '$lib/modules/cards/types/card.types';
import { formStringValue } from '$lib/shared/utils/form-data';
import { getActiveBankOptions } from '$lib/server/modules/banks/bank.service';
import {
	ActiveBankNotFoundError,
	CardNotFoundError,
	CreditInstallmentAlreadyPaidError,
	CreditInstallmentCannotUnpayError,
	CreditInstallmentNotFoundError,
	CreditInstallmentNotPaidError,
	InvalidCardKindChangeError
} from '$lib/server/modules/cards/card.errors';
import {
	createCard,
	deleteCard,
	getCards,
	payCreditInstallment,
	unpayCreditInstallment,
	updateCard
} from '$lib/server/modules/cards/card.service';

function cardFormValues(entries: Record<string, FormDataEntryValue>) {
	const kind: CardKind = entries.kind === 'debit' ? 'debit' : 'credit';
	return {
		id: formStringValue(entries.id),
		kind,
		alias: formStringValue(entries.alias),
		bankId: formStringValue(entries.bankId),
		color: formStringValue(entries.color),
		lastFourDigits: formStringValue(entries.lastFourDigits),
		currencyCode: formStringValue(entries.currencyCode),
		initialBalance: formStringValue(entries.initialBalance),
		accountId: formStringValue(entries.accountId),
		maximumOfferedCredit: formStringValue(entries.maximumOfferedCredit),
		statementDay: formStringValue(entries.statementDay),
		paymentDueDay: formStringValue(entries.paymentDueDay)
	};
}

export async function load() {
	const [cards, banks] = await Promise.all([getCards(), getActiveBankOptions()]);
	return { cards, banks };
}

export const actions = {
	createCard: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createCardSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-card' as const,
				errors: result.error.flatten().fieldErrors,
				values: cardFormValues(entries)
			});
		}

		try {
			await createCard(result.data);
			return { action: 'create-card' as const, success: 'Cuenta registrada correctamente.' };
		} catch (error) {
			if (error instanceof ActiveBankNotFoundError) {
				return fail(400, { action: 'create-card' as const, message: error.message });
			}
			throw error;
		}
	},
	updateCard: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateCardSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-card' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: cardFormValues(entries)
			});
		}

		try {
			await updateCard(result.data);
			return { action: 'update-card' as const, success: 'Cuenta actualizada correctamente.' };
		} catch (error) {
			if (
				error instanceof ActiveBankNotFoundError ||
				error instanceof CardNotFoundError ||
				error instanceof InvalidCardKindChangeError
			) {
				return fail(400, {
					action: 'update-card' as const,
					targetId: result.data.id,
					message: error.message,
					values: cardFormValues(entries)
				});
			}
			throw error;
		}
	},
	deleteCard: async ({ request }) => {
		const result = deleteCardSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, { action: 'delete-card' as const, message: 'Cuenta inválida.' });
		}

		try {
			await deleteCard(result.data.id);
			return { action: 'delete-card' as const, success: 'Cuenta eliminada correctamente.' };
		} catch (error) {
			if (error instanceof CardNotFoundError) {
				return fail(400, {
					action: 'delete-card' as const,
					targetId: result.data.id,
					message: error.message
				});
			}
			throw error;
		}
	},
	payCreditInstallment: async ({ request }) => {
		const result = payCreditInstallmentSchema.safeParse(Object.fromEntries(await request.formData()));
		const targetId = result.success ? result.data.cardId : undefined;
		if (!result.success) {
			return fail(400, {
				action: 'pay-credit-installment' as const,
				targetId,
				message: 'Mensualidad inválida.'
			});
		}

		try {
			await payCreditInstallment(result.data);
			return {
				action: 'pay-credit-installment' as const,
				targetId: result.data.cardId,
				success: 'Mensualidad marcada como pagada.'
			};
		} catch (error) {
			if (
				error instanceof CreditInstallmentNotFoundError ||
				error instanceof CreditInstallmentAlreadyPaidError
			) {
				return fail(400, {
					action: 'pay-credit-installment' as const,
					targetId: result.data.cardId,
					message: error.message
				});
			}
			throw error;
		}
	},
	unpayCreditInstallment: async ({ request }) => {
		const result = payCreditInstallmentSchema.safeParse(Object.fromEntries(await request.formData()));
		const targetId = result.success ? result.data.cardId : undefined;
		if (!result.success) {
			return fail(400, {
				action: 'unpay-credit-installment' as const,
				targetId,
				message: 'Mensualidad inválida.'
			});
		}

		try {
			await unpayCreditInstallment(result.data);
			return {
				action: 'unpay-credit-installment' as const,
				targetId: result.data.cardId,
				success: 'Mensualidad desmarcada.'
			};
		} catch (error) {
			if (
				error instanceof CreditInstallmentNotFoundError ||
				error instanceof CreditInstallmentNotPaidError ||
				error instanceof CreditInstallmentCannotUnpayError
			) {
				return fail(400, {
					action: 'unpay-credit-installment' as const,
					targetId: result.data.cardId,
					message: error.message
				});
			}
			throw error;
		}
	}
};
