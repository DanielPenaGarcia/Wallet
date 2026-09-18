import type { CardKind } from './card.types';

export type CardFormValues = {
	id?: string;
	kind: CardKind;
	alias: string;
	bankId: string;
	color: string;
	lastFourDigits: string;
	currencyCode: string;
	initialBalance: string;
	accountId: string;
	maximumOfferedCredit: string;
	statementDay: string;
	paymentDueDay: string;
	statementAmount?: string;
	balanceAmount?: string;
};

export type CardFormFeedback = {
	action:
		| 'create-card'
		| 'update-card'
		| 'delete-card'
		| 'pay-credit-installment'
		| 'unpay-credit-installment'
		| 'register-card-statement'
		| 'adjust-card-balance';
	targetId?: string;
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	values?: Partial<CardFormValues>;
};
