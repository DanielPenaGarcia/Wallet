export type AccountFormValues = {
	id?: string;
	accountType?: string;
	name?: string;
	bankId?: string;
	cardLastFourDigits?: string;
	cardColor?: string;
	initialBalance?: string;
	creditLimit?: string;
	statementDay?: string;
	paymentDueDay?: string;
	isActive?: boolean;
	newBalance?: string;
	reason?: string;
};

export type AccountFormFeedback = {
	action:
		| 'create-account'
		| 'update-account'
		| 'delete-account'
		| 'adjust-account-balance'
		| 'toggle-credit-account-active';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: AccountFormValues;
};
