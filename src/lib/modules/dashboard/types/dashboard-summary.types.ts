export type DashboardExpenseReserve = {
	expenseId: string;
	name: string;
	categoryName: string;
	categoryColor: string;
	amountKind: 'fixed' | 'estimated';
	amountLabel: string;
	frequencyLabel: string;
	nextDueDateIso: string;
	nextDueDateLabel: string;
	paymentsUntilDue: number;
	reserveAmount: number;
	reserveAmountLabel: string;
	monthlyReserveAmount: number;
	monthlyReserveAmountLabel: string;
	status: 'pending' | 'paid';
	statusLabel: string;
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
	nextDueDateIso: string;
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
	debitBalanceTotal: number;
	debitBalanceTotalLabel: string;
	availableAfterReserve: number | null;
	availableAfterReserveLabel: string | null;
	currencyCode: string;
	expenseCount: number;
	estimatedExpenseCount: number;
	reserves: DashboardExpenseReserve[];
	semimonthlyReserves: DashboardExpenseReserve[];
	creditCardReserves: DashboardCreditCardReserve[];
};
