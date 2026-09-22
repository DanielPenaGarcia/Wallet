import type { LoanDirection } from '$lib/modules/loans/types/loan.types';

export type CreateLoanInput = {
	name: string;
	direction: LoanDirection;
	counterpartyName: string;
	principalAmountCents: number;
	totalRepaymentCents: number;
	installmentCount: number;
	firstPaymentDate: string;
	currencyCode: string;
	accountId: string;
	occurredAt: string;
};
