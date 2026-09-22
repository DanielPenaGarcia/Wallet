import { getStatementOutstandingAmount } from '$lib/modules/credit-card-statements/utils/credit-card-statement-calculations';
import type {
	DashboardCreditCardObligation,
	DashboardGoalSummary,
	DashboardLoanSummary,
	DashboardRecentMovement,
	DashboardSummary,
	DashboardUpcomingExpense,
	DashboardUpcomingIncome
} from '$lib/modules/dashboard/types/dashboard-summary.types';
import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import { accountService, type AccountService } from '$lib/server/accounts/account.service';
import { creditCardStatementService, type CreditCardStatementService } from '$lib/server/credit-card-statements/credit-card-statement.service';
import { financialGoalService, type FinancialGoalService } from '$lib/server/goals/financial-goal.service';
import { movementService, type MovementService } from '$lib/server/movements/movement.service';
import type { MovementOutput } from '$lib/server/movements/outputs/movement.output';
import { financialPlanningService, type FinancialPlanningService } from '$lib/server/planning/financial-planning.service';
import { loanService, type LoanService } from '$lib/server/loans/loan.service';
import { recurringExpenseService, type RecurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';
import { recurringIncomeService, type RecurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';
import { toIsoDate } from '$lib/shared/utils/local-date';
import { nextRecurringPaymentDate } from '$lib/shared/utils/recurring-payment-schedule';

const dashboardMovementLimit = 5;
const currencyCode = 'MXN';

export class DashboardService {
	constructor(
		private readonly accounts: AccountService,
		private readonly movements: MovementService,
		private readonly recurringIncomes: RecurringIncomeService,
		private readonly recurringExpenses: RecurringExpenseService,
		private readonly creditCardStatements: CreditCardStatementService,
		private readonly goals: FinancialGoalService,
		private readonly planning: FinancialPlanningService,
		private readonly loans: LoanService
	) {}

	async getSummary(referenceDate = new Date()): Promise<DashboardSummary> {
		const monthRange = this.monthRange(referenceDate);
		const [accounts, monthMovements, recentMovements, recurringIncomes, recurringExpenses, goals, loans] = await Promise.all([
			this.accounts.getAccounts(),
			this.movements.listMovements({
				startDate: `${monthRange.startsOn}T00:00:00.000Z`,
				endDate: `${monthRange.endsOn}T23:59:59.999Z`
			}),
			this.movements.listMovements({ limit: dashboardMovementLimit }),
			this.recurringIncomes.getRecurringIncomes(),
			this.recurringExpenses.getRecurringExpenses(),
			this.goals.getFinancialGoals(),
			this.loans.getLoans()
		]);
		const creditAccounts = accounts.filter((account) => account.type === 'credit');
		const latestStatements = await Promise.all(
			creditAccounts.map((account) => this.creditCardStatements.getLatestStatement(account.id))
		);
		const planningPeriods = this.planning.projectFreeMoneyPeriods(recurringIncomes, recurringExpenses, referenceDate, loans);
		const accountNames = new Map(accounts.map((account) => [
			account.id,
			account.type === 'personal' ? 'Efectivo' : account.name
		]));

		return {
			currencyCode,
			current: {
				availableMoneyCents: accounts
					.filter((account) => account.type === 'personal' || account.type === 'debit')
					.reduce((total, account) => total + account.balanceCents, 0),
				consumedCreditCents: creditAccounts.reduce((total, account) => total + Math.max(account.balanceCents, 0), 0),
				realMoneyAccountCount: accounts.filter((account) => account.type === 'personal' || account.type === 'debit').length,
				creditAccountCount: creditAccounts.length
			},
			monthlyActivity: {
				monthStartsOn: monthRange.startsOn,
				monthEndsOn: monthRange.endsOn,
				incomeCents: this.sumMovements(monthMovements, 'income'),
				paidExpenseCents: this.sumMovements(monthMovements, 'expense'),
				creditPurchaseCents: this.sumMovements(monthMovements, 'credit_purchase'),
				creditCardPaymentCents: this.sumMovements(monthMovements, 'credit_card_payment')
			},
			upcomingIncome: this.nextIncome(recurringIncomes, referenceDate),
			upcomingExpenses: this.nextExpenses(recurringExpenses, referenceDate),
			creditCards: creditAccounts.map((account, index): DashboardCreditCardObligation => {
				const creditLimitCents = account.creditLimitCents ?? 0;
				return {
					accountId: account.id,
					name: account.name,
					bankName: account.bank?.name ?? 'Sin banco',
					cardLastFourDigits: account.cardLastFourDigits,
					cardColor: account.cardColor,
					consumedBalanceCents: account.balanceCents,
					availableCreditCents: Math.max(creditLimitCents - account.balanceCents, 0),
					creditLimitCents,
					statementOutstandingCents: getStatementOutstandingAmount(latestStatements[index] ?? null),
					paymentDueDate: latestStatements[index]?.paymentDueDate ?? null,
					isActive: account.isActive
				};
			}),
			loans: this.loanSummary(loans),
			goals: this.goalSummaries(goals, planningPeriods[0]),
			recentMovements: recentMovements.map((movement) => this.recentMovement(movement, accountNames))
		};
	}

	private monthRange(referenceDate: Date) {
		return {
			startsOn: toIsoDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)),
			endsOn: toIsoDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0))
		};
	}

	private sumMovements(movements: MovementOutput[], type: MovementOutput['type']) {
		return movements
			.filter((movement) => movement.type === type)
			.reduce((total, movement) => total + movement.amountCents, 0);
	}

	private nextIncome(incomes: RecurringIncome[], referenceDate: Date): DashboardUpcomingIncome {
		const upcomingIncomes: NonNullable<DashboardUpcomingIncome>[] = [];

		for (const income of incomes) {
			if (!income.isActive) continue;
			const date = nextRecurringPaymentDate(referenceDate, income.paymentSchedule);
			if (!date) continue;
			upcomingIncomes.push({
				id: income.id,
				title: income.title,
				expectedAmountCents: income.expectedAmountCents,
				date: toIsoDate(date)
			});
		}

		return upcomingIncomes.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
	}

	private nextExpenses(expenses: RecurringExpense[], referenceDate: Date): DashboardUpcomingExpense[] {
		const upcomingExpenses: DashboardUpcomingExpense[] = [];

		for (const expense of expenses) {
			if (!expense.isActive) continue;
			const date = nextRecurringPaymentDate(referenceDate, expense.paymentSchedule, {
				customInterval: {
					count: expense.customIntervalCount,
					unit: expense.customIntervalUnit
				}
			});
			if (!date) continue;
			upcomingExpenses.push({
				id: expense.id,
				name: expense.name,
				categoryName: expense.category?.name ?? 'Sin categoria',
				categoryColor: expense.category?.color ?? '#64748b',
				amountCents: expense.amountCents,
				amountKind: expense.amountKind,
				date: toIsoDate(date)
			});
		}

		return upcomingExpenses.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
	}

	private goalSummaries(goals: FinancialGoal[], nextPeriod: { date: string; freeAmountCents: number } | undefined): DashboardGoalSummary[] {
		return goals
			.filter((goal) => goal.status === 'active')
			.map((goal) => {
				const remainingAmountCents = Math.max(goal.targetAmountCents - goal.currentAmountCents, 0);
				const estimatedNextContributionCents = nextPeriod
					? Math.floor(nextPeriod.freeAmountCents * goal.distributionPercentage / 100)
					: null;
				return {
					id: goal.id,
					name: goal.name,
					targetAmountCents: goal.targetAmountCents,
					currentAmountCents: goal.currentAmountCents,
					remainingAmountCents,
					progressPercentage: goal.targetAmountCents > 0
						? Math.min(100, Math.round(goal.currentAmountCents * 100 / goal.targetAmountCents))
						: 0,
					distributionPercentage: goal.distributionPercentage,
					estimatedNextContributionCents,
					estimatedContributionDate: estimatedNextContributionCents && estimatedNextContributionCents > 0
						? nextPeriod?.date ?? null
						: null
				};
			})
			.sort((a, b) => b.distributionPercentage - a.distributionPercentage || a.name.localeCompare(b.name));
	}

	private loanSummary(loans: Awaited<ReturnType<LoanService['getLoans']>>): DashboardLoanSummary {
		const activeLoans = loans.filter((loan) => loan.status === 'active' && loan.outstandingAmountCents > 0);
		const nextBorrowedLoan = activeLoans
			.filter((loan) => loan.direction === 'borrowed' && loan.nextInstallment)
			.sort((a, b) => (a.nextInstallment?.dueDate ?? '').localeCompare(b.nextInstallment?.dueDate ?? ''))[0];
		const nextLentLoan = activeLoans
			.filter((loan) => loan.direction === 'lent' && loan.nextInstallment)
			.sort((a, b) => (a.nextInstallment?.dueDate ?? '').localeCompare(b.nextInstallment?.dueDate ?? ''))[0];

		return {
			borrowedOutstandingCents: activeLoans
				.filter((loan) => loan.direction === 'borrowed')
				.reduce((total, loan) => total + loan.outstandingAmountCents, 0),
			lentOutstandingCents: activeLoans
				.filter((loan) => loan.direction === 'lent')
				.reduce((total, loan) => total + loan.outstandingAmountCents, 0),
			nextBorrowedInstallment: nextBorrowedLoan?.nextInstallment
				? {
					loanId: nextBorrowedLoan.id,
					name: nextBorrowedLoan.name,
					dueDate: nextBorrowedLoan.nextInstallment.dueDate,
					amountCents: nextBorrowedLoan.nextInstallment.remainingAmountCents,
					currencyCode: nextBorrowedLoan.currencyCode
				}
				: null,
			nextLentInstallment: nextLentLoan?.nextInstallment
				? {
					loanId: nextLentLoan.id,
					name: nextLentLoan.name,
					dueDate: nextLentLoan.nextInstallment.dueDate,
					amountCents: nextLentLoan.nextInstallment.remainingAmountCents,
					currencyCode: nextLentLoan.currencyCode
				}
				: null
		};
	}

	private recentMovement(movement: MovementOutput, accountNames: Map<string, string>): DashboardRecentMovement {
		return {
			id: movement.id,
			type: movement.type,
			title: movement.title,
			amountCents: movement.amountCents,
			currencyCode: movement.currencyCode,
			occurredAt: movement.occurredAt,
			accountLabel: this.movementAccountLabel(movement, accountNames)
		};
	}

	private movementAccountLabel(movement: MovementOutput, accountNames: Map<string, string>) {
		const sourceName = movement.sourceAccountId ? accountNames.get(movement.sourceAccountId) : null;
		const destinationName = movement.destinationAccountId ? accountNames.get(movement.destinationAccountId) : null;
		if (sourceName && destinationName) return `${sourceName} -> ${destinationName}`;
		return sourceName ?? destinationName ?? null;
	}
}

export const dashboardService = new DashboardService(
	accountService,
	movementService,
	recurringIncomeService,
	recurringExpenseService,
	creditCardStatementService,
	financialGoalService,
	financialPlanningService,
	loanService
);
