export const loanDirections = ['borrowed', 'lent'] as const;
export const loanStatuses = ['active', 'cancelled'] as const;

export type LoanDirection = (typeof loanDirections)[number];
export type LoanStatus = (typeof loanStatuses)[number];

export type Loan = {
	id: string;
	name: string;
	direction: LoanDirection;
	counterpartyName: string;
	principalAmountCents: number;
	totalRepaymentCents: number;
	installmentCount: number;
	firstPaymentDate: string;
	currencyCode: string;
	status: LoanStatus;
	createdAt: string;
	updatedAt: string;
	cancelledAt: string | null;
};

export type LoanInstallment = {
	number: number;
	dueDate: string;
	amountCents: number;
	coveredAmountCents: number;
	remainingAmountCents: number;
	status: 'pending' | 'partial' | 'paid';
};

export type LoanSummary = Loan & {
	financingCostCents: number;
	paidAmountCents: number;
	outstandingAmountCents: number;
	progressPercentage: number;
	nextInstallment: LoanInstallment | null;
	installments: LoanInstallment[];
};
