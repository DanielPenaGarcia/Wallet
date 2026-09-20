export type CreateInstallmentPurchaseInput = {
	accountId: string;
	description: string;
	purchaseDate: string;
	originalAmountCents: number;
	installmentAmountCents: number;
	totalInstallments: number;
	billedInstallments: number;
	paidInstallments: number;
};
