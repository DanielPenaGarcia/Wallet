import type { CardColor, CardKind, MoneyInMinorUnits } from './card.types';
import type { InterestFreeInstallmentPurchase } from './interest-free-installment.types';

export type CardListItem = {
	id: string;
	kind: CardKind;
	alias: string;
	bankId: string;
	bankName: string;
	color: CardColor;
	lastFourDigits: string;
	currencyCode: string;
	initialBalance: MoneyInMinorUnits;
	currentBalance: MoneyInMinorUnits;
	cashExpenseAmount: MoneyInMinorUnits | null;
	interestFreeOutstandingAmount: MoneyInMinorUnits | null;
	accountId: string | null;
	maximumOfferedCredit: MoneyInMinorUnits | null;
	statementDay: number | null;
	paymentDueDay: number | null;
	interestFreeInstallmentPurchases: InterestFreeInstallmentPurchase[];
};
