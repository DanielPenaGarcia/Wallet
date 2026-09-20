export type CreditCardStatementFormValues = {
	id?: string;
	accountId?: string;
	periodStartDate?: string;
	periodEndDate?: string;
	statementDate?: string;
	paymentDueDate?: string;
	statementBalance?: string;
	paidAmount?: string;
};

export type CreditCardStatementFormFeedback = {
	action: 'create-credit-card-statement' | 'update-credit-card-statement';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: CreditCardStatementFormValues;
};
