export type DashboardExpenseReserve = {
	expenseId: string;
	name: string;
	categoryName: string;
	categoryColor: string;
	amountKind: 'fixed' | 'estimated';
	amountLabel: string;
	frequencyLabel: string;
	nextDueDateLabel: string;
	paymentsUntilDue: number;
	reserveAmount: number;
	reserveAmountLabel: string;
	currencyCode: string;
};

export type DashboardCreditCardReserve = {
	cardId: string;
	alias: string;
	bankName: string;
	lastFourDigits: string;
	payableAmount: number;
	payableAmountLabel: string;
	cashExpenseAmount: number;
	cashExpenseAmountLabel: string;
	nextInterestFreeInstallmentsAmount: number;
	nextInterestFreeInstallmentsAmountLabel: string;
	nextDueDateLabel: string;
	semimonthsUntilDue: number;
	reserveAmount: number;
	reserveAmountLabel: string;
	currencyCode: string;
};

export type DashboardSummary = {
	nextIncomeDateLabel: string | null;
	nextIncomeAmountLabel: string | null;
	reserveTotal: number;
	reserveTotalLabel: string;
	availableAfterReserve: number | null;
	availableAfterReserveLabel: string | null;
	currencyCode: string;
	expenseCount: number;
	estimatedExpenseCount: number;
	reserves: DashboardExpenseReserve[];
	creditCardReserves: DashboardCreditCardReserve[];
};
