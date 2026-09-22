export type DashboardCurrentSummary = {
	availableMoneyCents: number;
	consumedCreditCents: number;
	realMoneyAccountCount: number;
	creditAccountCount: number;
};

export type DashboardMonthlyActivity = {
	monthStartsOn: string;
	monthEndsOn: string;
	incomeCents: number;
	paidExpenseCents: number;
	creditPurchaseCents: number;
	creditCardPaymentCents: number;
};

export type DashboardUpcomingIncome = {
	id: string;
	title: string;
	expectedAmountCents: number;
	date: string;
} | null;

export type DashboardUpcomingExpense = {
	id: string;
	name: string;
	categoryName: string;
	categoryColor: string;
	amountCents: number;
	amountKind: 'fixed' | 'estimated';
	date: string;
};

export type DashboardCreditCardObligation = {
	accountId: string;
	name: string;
	bankName: string;
	cardLastFourDigits: string | null;
	cardColor: string | null;
	consumedBalanceCents: number;
	availableCreditCents: number;
	creditLimitCents: number;
	statementOutstandingCents: number;
	paymentDueDate: string | null;
	isActive: boolean;
};

export type DashboardGoalSummary = {
	id: string;
	name: string;
	targetAmountCents: number;
	currentAmountCents: number;
	remainingAmountCents: number;
	progressPercentage: number;
	distributionPercentage: number;
	estimatedNextContributionCents: number | null;
	estimatedContributionDate: string | null;
};

export type DashboardRecentMovement = {
	id: string;
	type: 'income' | 'expense' | 'transfer' | 'credit_purchase' | 'credit_card_payment' | 'adjustment';
	title: string;
	amountCents: number;
	currencyCode: string;
	occurredAt: string;
	accountLabel: string | null;
};

export type DashboardSummary = {
	currencyCode: string;
	current: DashboardCurrentSummary;
	monthlyActivity: DashboardMonthlyActivity;
	upcomingIncome: DashboardUpcomingIncome;
	upcomingExpenses: DashboardUpcomingExpense[];
	creditCards: DashboardCreditCardObligation[];
	goals: DashboardGoalSummary[];
	recentMovements: DashboardRecentMovement[];
};
