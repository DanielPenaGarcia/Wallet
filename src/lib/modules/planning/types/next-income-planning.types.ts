import type { AccountType } from '$lib/modules/accounts/types/account.types';

export type PlanningObligationKind =
	| 'recurring_expense_debit'
	| 'recurring_expense_credit'
	| 'credit_card_statement'
	| 'loan_payment';

export type PlanningObligationImpact = 'cash_need' | 'credit_consumption';

export type PlanningObligation = {
	id: string;
	kind: PlanningObligationKind;
	impact: PlanningObligationImpact;
	title: string;
	date: string;
	amountCents: number;
	accountId: string | null;
	accountName: string | null;
	accountType: AccountType | null;
	coveredAmountCents: number;
	uncoveredAmountCents: number;
};

export type PlanningGoalAllocation = {
	goalId: string;
	name: string;
	distributionPercentage: number;
	allocatedAmountCents: number;
	remainingAmountCents: number;
};

export type NextIncomePlanning = {
	currencyCode: string;
	generatedAt: string;
	period: {
		startDate: string | null;
		endDate: string | null;
		hasFollowingIncome: boolean;
	};
	nextIncome: {
		date: string;
		amountCents: number;
		titles: string[];
	} | null;
	existingRealMoneyCents: number;
	totalCashAvailableCents: number;
	cashObligations: PlanningObligation[];
	creditConsumptions: PlanningObligation[];
	statementPayments: PlanningObligation[];
	unassignedRecurringExpenses: PlanningObligation[];
	totalCashObligationsCents: number;
	totalCreditConsumptionCents: number;
	totalStatementPaymentsCents: number;
	coveredCashObligationsCents: number;
	uncoveredCashObligationsCents: number;
	freeCashCents: number;
	goalAllocations: PlanningGoalAllocation[];
	remainingFreeCashCents: number;
	alerts: string[];
};
