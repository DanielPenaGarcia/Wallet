import type { LoanDirection } from './loan.types';

export type LoanFormValues = {
	id?: string;
	name?: string;
	direction?: LoanDirection;
	counterpartyName?: string;
	principalAmount?: string;
	totalRepayment?: string;
	installmentCount?: string;
	firstPaymentDate?: string;
	currencyCode?: string;
	accountId?: string;
	occurredAt?: string;
	amount?: string;
	description?: string;
};

export type LoanFormFeedback = {
	action: 'create-loan' | 'update-loan' | 'delete-loan' | 'register-payment' | 'register-collection' | 'cancel-loan';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: LoanFormValues;
};
