export type InstallmentPurchaseFormValues = {
	id?: string;
	accountId?: string;
	description?: string;
	purchaseDate?: string;
	originalAmount?: string;
	installmentAmount?: string;
	totalInstallments?: string;
	billedInstallments?: string;
	paidInstallments?: string;
};

export type InstallmentPurchaseFormFeedback = {
	action: 'create-installment-purchase' | 'update-installment-purchase' | 'delete-installment-purchase';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: InstallmentPurchaseFormValues;
};
