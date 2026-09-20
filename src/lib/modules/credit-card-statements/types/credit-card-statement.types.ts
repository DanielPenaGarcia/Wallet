export type CreditCardStatement = {
	id: string;
	accountId: string;
	periodStartDate: string;
	periodEndDate: string;
	statementDate: string;
	paymentDueDate: string;
	statementBalanceCents: number;
	paidAmountCents: number;
	createdAt: string;
	updatedAt: string;
};

export type CreditCardStatementStatus = 'pending' | 'partial' | 'paid';

export type CreditCardCycle = {
	previousStatementDate: string;
	previousPeriodStart: string;
	previousPeriodEnd: string;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	nextStatementDate: string;
};

export type CreditCardProjection = {
	cycle: CreditCardCycle;
	latestStatement: CreditCardStatement | null;
	latestStatementStatus: CreditCardStatementStatus | null;
	outstandingPreviousStatementCents: number;
	futureInstallmentBalanceCents: number;
	nextInstallmentsCents: number;
	estimatedUnbilledNonInstallmentCents: number;
	presentationUnbilledNonInstallmentCents: number;
	estimatedNewStatementChargesCents: number;
	estimatedNextStatementBaseCents: number;
	hasBalanceCompositionInconsistency: boolean;
};
