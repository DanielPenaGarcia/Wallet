import type { Account } from '../types/account.types';
import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { CardColor } from '$lib/modules/cards/types/card.types';

export function toCardListItem(account: Account): CardListItem {
	const color = account.cardColor ?? account.bank?.color ?? '#123a63';
	return {
		id: account.id,
		kind: account.type === 'credit' ? 'credit' : 'debit',
		alias: account.type === 'personal' ? 'Efectivo' : account.name,
		bankId: account.bankId ?? 'personal',
		bankName: account.bank?.name ?? 'Efectivo',
		isDefault: account.type === 'personal',
		color: color as CardColor,
		lastFourDigits: account.cardLastFourDigits ?? '',
		currencyCode: 'MXN',
		initialBalance: account.balanceCents,
		currentBalance: account.balanceCents,
		cashExpenseAmount: null,
		interestFreeOutstandingAmount: null,
		accountId: account.id,
		maximumOfferedCredit: account.creditLimitCents,
		statementDay: account.statementDay,
		paymentDueDay: account.paymentDueDay,
		interestFreeInstallmentPurchases: []
	};
}
