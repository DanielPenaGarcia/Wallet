export type CreateCreditCardStatementInput = {
	accountId: string;
	periodStartDate: string;
	periodEndDate: string;
	statementDate: string;
	paymentDueDate: string;
	statementBalanceCents: number;
	paidAmountCents: number;
};
