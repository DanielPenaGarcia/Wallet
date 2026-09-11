import type { CardColor, MoneyInMinorUnits } from '$lib/modules/cards/types/card.types';

type CreateCardBaseInput = {
	alias: string;
	bankId: string;
	color: CardColor;
	lastFourDigits: string;
	currencyCode: string;
	initialBalance: MoneyInMinorUnits;
};

export type CreateDebitCardInput = CreateCardBaseInput & {
	kind: 'debit';
	accountId: string;
};

export type CreateCreditCardInput = CreateCardBaseInput & {
	kind: 'credit';
	maximumOfferedCredit: MoneyInMinorUnits;
	statementDay: number;
	paymentDueDay: number;
};

export type CreateCardInput = CreateDebitCardInput | CreateCreditCardInput;
