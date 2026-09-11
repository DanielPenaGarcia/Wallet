import type { MoneyInMinorUnits } from './card.types';

export type CreditCardInstallment = {
	movementId: string;
	installmentNumber: number;
	totalInstallments: number;
	amount: MoneyInMinorUnits;
	paid: boolean;
	paidAt: string | null;
};

export type InterestFreeInstallmentPurchase = {
	id: string;
	description: string;
	purchasedOn: string;
	originalAmount: MoneyInMinorUnits;
	totalInstallments: number;
	unpaidAmount: MoneyInMinorUnits;
	installments: CreditCardInstallment[];
};
