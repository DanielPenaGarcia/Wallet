import type { CardListItem } from '../types/card-list-item.types';

export function nextInterestFreeInstallmentsAmount(card: CardListItem) {
	return card.interestFreeInstallmentPurchases.reduce((total, purchase) => {
		const nextInstallment = purchase.installments.find((installment) => !installment.paid);
		return total + (nextInstallment?.amount ?? 0);
	}, 0);
}

export function statementPayableAmount(card: CardListItem) {
	return (card.cashExpenseAmount ?? 0) + nextInterestFreeInstallmentsAmount(card);
}
