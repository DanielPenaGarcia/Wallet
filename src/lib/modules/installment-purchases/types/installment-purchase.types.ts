export type InstallmentPurchase = {
	id: string;
	accountId: string;
	description: string;
	purchaseDate: string;
	originalAmountCents: number;
	installmentAmountCents: number;
	totalInstallments: number;
	billedInstallments: number;
	paidInstallments: number;
	createdAt: string;
	updatedAt: string;
};

export type InstallmentPurchaseAmounts = {
	paidAmountCents: number;
	unpaidBilledAmountCents: number;
	futureAmountCents: number;
	outstandingAmountCents: number;
	nextInstallmentAmountCents: number;
};

export type InstallmentPurchaseCounts = {
	unpaidBilledInstallments: number;
	futureInstallments: number;
	remainingInstallments: number;
	isCompleted: boolean;
};

export type InstallmentPurchaseSummary = InstallmentPurchaseAmounts & {
	activePurchases: number;
	completedPurchases: number;
};
