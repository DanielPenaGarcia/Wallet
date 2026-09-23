import type { Account } from '$lib/modules/accounts/types/account.types';
import { getAccountDisplayName, sumRealMoneyBalances } from '$lib/modules/accounts/utils/account-labels';
import { getStatementOutstandingAmount } from '$lib/modules/credit-card-statements/utils/credit-card-statement-calculations';
import type { CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import { remainingGoalAmount } from '$lib/modules/goals/utils/financial-goal-labels';
import type {
	NextIncomePlanning,
	PlanningGoalAllocation,
	PlanningObligation
} from '$lib/modules/planning/types/next-income-planning.types';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { FinancialPlanningPeriod } from '$lib/modules/goals/types/goal-projection.types';
import type { LoanSummary } from '$lib/modules/loans/types/loan.types';
import { toIsoDate } from '$lib/shared/utils/local-date';
import { addDays, parseLocalDate, startOfLocalDay } from '$lib/shared/utils/recurrence-date';
import { nextRecurringPaymentDate } from '$lib/shared/utils/recurring-payment-schedule';

const projectionIncomeLimit = 50000;
const projectionYearLimit = 100;

type DatedAmount = {
	date: string;
	amountCents: number;
	title?: string;
};

export type NextIncomePlanningInput = {
	recurringIncomes: RecurringIncome[];
	recurringExpenses: RecurringExpense[];
	accounts: Account[];
	creditCardStatements: CreditCardStatement[];
	goals: FinancialGoal[];
	loans?: LoanSummary[];
	referenceDate?: Date;
	currencyCode?: string;
};

type IncomeEvent = DatedAmount & {
	titles: string[];
};

export class FinancialPlanningService {
	planNextIncome(input: NextIncomePlanningInput): NextIncomePlanning {
		const referenceDate = startOfLocalDay(input.referenceDate ?? new Date());
		const currencyCode = input.currencyCode ?? 'MXN';
		const generatedAt = (input.referenceDate ?? new Date()).toISOString();
		const incomeEvents = this.groupIncomeEvents(
			this.projectIncomeEvents(input.recurringIncomes, referenceDate, addDays(referenceDate, 366))
		);
		const nextIncome = incomeEvents[0] ?? null;
		const followingIncome = incomeEvents[1] ?? null;

		if (!nextIncome) {
			return this.emptyNextIncomePlan({
				currencyCode,
				generatedAt,
				existingRealMoneyCents: this.sumExistingRealMoney(input.accounts),
				alerts: ['Configura al menos un ingreso recurrente activo para generar la planificación.']
			});
		}

		const periodStart = parseLocalDate(nextIncome.date) ?? referenceDate;
		const periodEnd = followingIncome
			? parseLocalDate(followingIncome.date) ?? addDays(periodStart, 30)
			: addDays(periodStart, 30);
		const periodStartDate = toIsoDate(periodStart);
		const periodEndDate = toIsoDate(periodEnd);
		const accountNames = new Map(input.accounts.map((account) => [
			account.id,
			getAccountDisplayName(account)
		]));
		const realMoneyCents = this.sumExistingRealMoney(input.accounts);
		const totalCashAvailableCents = realMoneyCents + nextIncome.amountCents;

		const recurringObligations = this.recurringExpenseObligations(
			input.recurringExpenses,
			periodStart,
			periodEnd,
			accountNames
		);
		const statementPayments = this.statementPaymentObligations(
			input.creditCardStatements,
			periodStartDate,
			periodEndDate,
			accountNames
		);
		const loanPayments = this.loanPaymentObligations(input.loans ?? [], periodStartDate, periodEndDate);
		const cashObligations = [
			...recurringObligations.filter((obligation) => obligation.impact === 'cash_need'),
			...statementPayments,
			...loanPayments
		].sort(this.compareObligations);
		const creditConsumptions = recurringObligations
			.filter((obligation) => obligation.impact === 'credit_consumption')
			.sort(this.compareObligations);
		const unassignedRecurringExpenses = recurringObligations
			.filter((obligation) => obligation.accountId === null)
			.sort(this.compareObligations);
		const allocatedCashObligations = this.allocateCash(cashObligations, totalCashAvailableCents);
		const totalCashObligationsCents = allocatedCashObligations.reduce((total, obligation) => total + obligation.amountCents, 0);
		const coveredCashObligationsCents = allocatedCashObligations.reduce((total, obligation) => total + obligation.coveredAmountCents, 0);
		const uncoveredCashObligationsCents = allocatedCashObligations.reduce((total, obligation) => total + obligation.uncoveredAmountCents, 0);
		const freeCashCents = Math.max(totalCashAvailableCents - coveredCashObligationsCents, 0);
		const goalAllocations = this.allocateGoals(input.goals, freeCashCents);
		const remainingFreeCashCents = Math.max(
			freeCashCents - goalAllocations.reduce((total, allocation) => total + allocation.allocatedAmountCents, 0),
			0
		);
		const alerts = this.planningAlerts({
			hasFollowingIncome: Boolean(followingIncome),
			unassignedRecurringExpenses,
			uncoveredCashObligationsCents
		});

		return {
			currencyCode,
			generatedAt,
			period: {
				startDate: periodStartDate,
				endDate: followingIncome ? periodEndDate : null,
				hasFollowingIncome: Boolean(followingIncome)
			},
			nextIncome: {
				date: nextIncome.date,
				amountCents: nextIncome.amountCents,
				titles: nextIncome.titles
			},
			existingRealMoneyCents: realMoneyCents,
			totalCashAvailableCents,
			cashObligations: allocatedCashObligations,
			creditConsumptions,
			statementPayments,
			unassignedRecurringExpenses,
			totalCashObligationsCents,
			totalCreditConsumptionCents: creditConsumptions.reduce((total, obligation) => total + obligation.amountCents, 0),
			totalStatementPaymentsCents: statementPayments.reduce((total, obligation) => total + obligation.amountCents, 0),
			coveredCashObligationsCents,
			uncoveredCashObligationsCents,
			freeCashCents,
			goalAllocations,
			remainingFreeCashCents,
			alerts
		};
	}

	projectFreeMoneyPeriods(
		recurringIncomes: RecurringIncome[],
		recurringExpenses: RecurringExpense[],
		from = new Date(),
		loans: LoanSummary[] = []
	): FinancialPlanningPeriod[] {
		const startsAt = startOfLocalDay(from);
		const endsAt = new Date(startsAt.getFullYear() + projectionYearLimit, startsAt.getMonth(), startsAt.getDate());
		const incomeEvents = this.projectIncomeEvents(recurringIncomes, startsAt, endsAt);
		if (incomeEvents.length === 0) return [];

		const incomeEventsByDate = this.groupAmountsByDate(incomeEvents).slice(0, projectionIncomeLimit);
		const lastIncomeDate = parseLocalDate(incomeEventsByDate[incomeEventsByDate.length - 1].date) ?? endsAt;
		const expenseEventsByDate = this.groupAmountsByDate(
			[
				...this.projectExpenseEvents(recurringExpenses, startsAt, lastIncomeDate),
				...this.projectLoanPaymentEvents(loans, startsAt, lastIncomeDate)
			]
		);

		let previousIncomeDate = startsAt;
		let expenseIndex = 0;
		return incomeEventsByDate.map((incomeEvent) => {
			const incomeDate = parseLocalDate(incomeEvent.date) ?? previousIncomeDate;
			let obligationAmountCents = 0;

			while (expenseIndex < expenseEventsByDate.length) {
				const expenseEvent = expenseEventsByDate[expenseIndex];
				const expenseDate = parseLocalDate(expenseEvent.date);
				if (!expenseDate) {
					expenseIndex += 1;
					continue;
				}
				if (expenseDate > incomeDate) break;
				if (expenseDate > previousIncomeDate) obligationAmountCents += expenseEvent.amountCents;
				expenseIndex += 1;
			}

			previousIncomeDate = incomeDate;

			return {
				date: incomeEvent.date,
				incomeAmountCents: incomeEvent.amountCents,
				obligationAmountCents,
				freeAmountCents: Math.max(0, incomeEvent.amountCents - obligationAmountCents)
			};
		});
	}

	private projectIncomeEvents(recurringIncomes: RecurringIncome[], startsAt: Date, endsAt: Date): DatedAmount[] {
		return recurringIncomes.flatMap((income) => {
			if (!income.isActive) return [];

			const events: DatedAmount[] = [];
			let nextDate = this.nextIncomeDateAfter(income, startsAt);

			while (nextDate && nextDate <= endsAt && events.length < projectionIncomeLimit) {
				events.push({ date: toIsoDate(nextDate), amountCents: income.expectedAmountCents, title: income.title });
				nextDate = this.nextIncomeDateAfter(income, nextDate);
			}

			return events;
		});
	}

	private groupIncomeEvents(events: DatedAmount[]): IncomeEvent[] {
		const grouped = new Map<string, IncomeEvent>();
		for (const event of events) {
			const current = grouped.get(event.date) ?? { date: event.date, amountCents: 0, titles: [] };
			current.amountCents += event.amountCents;
			current.titles.push(event.title ?? 'Ingreso recurrente');
			grouped.set(event.date, current);
		}

		return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
	}

	private projectExpenseEvents(recurringExpenses: RecurringExpense[], startsAt: Date, endsAt: Date): DatedAmount[] {
		return recurringExpenses.flatMap((expense) => {
			if (!expense.isActive) return [];

			const events: DatedAmount[] = [];
			let nextDate = this.nextExpenseDateAfter(expense, startsAt);

			while (nextDate && nextDate <= endsAt) {
				events.push({ date: toIsoDate(nextDate), amountCents: expense.amountCents });
				nextDate = this.nextExpenseDateAfter(expense, nextDate);
			}

			return events;
		});
	}

	private recurringExpenseObligations(
		expenses: RecurringExpense[],
		periodStart: Date,
		periodEnd: Date,
		accountNames: Map<string, string>
	): PlanningObligation[] {
		return expenses.flatMap((expense) => {
			if (!expense.isActive) return [];

			const obligations: PlanningObligation[] = [];
			let nextDate = this.nextExpenseDateAfter(expense, addDays(periodStart, -1));

			while (nextDate && nextDate <= periodEnd) {
				if (nextDate >= periodStart) {
					const accountType = expense.paymentAccount?.type ?? null;
					const isCredit = accountType === 'credit';
					obligations.push({
						id: `${expense.id}:${toIsoDate(nextDate)}`,
						kind: isCredit ? 'recurring_expense_credit' : 'recurring_expense_debit',
						impact: isCredit ? 'credit_consumption' : 'cash_need',
						title: expense.name,
						date: toIsoDate(nextDate),
						amountCents: expense.amountCents,
						accountId: expense.paymentAccountId,
						accountName: expense.paymentAccountId ? accountNames.get(expense.paymentAccountId) ?? expense.paymentAccount?.name ?? null : null,
						accountType,
						coveredAmountCents: 0,
						uncoveredAmountCents: 0
					});
				}
				nextDate = this.nextExpenseDateAfter(expense, nextDate);
			}

			return obligations;
		});
	}

	private statementPaymentObligations(
		statements: CreditCardStatement[],
		periodStartDate: string,
		periodEndDate: string,
		accountNames: Map<string, string>
	): PlanningObligation[] {
		return statements
			.map((statement): PlanningObligation | null => {
				const amountCents = getStatementOutstandingAmount(statement);
				if (amountCents <= 0) return null;
				if (statement.paymentDueDate < periodStartDate || statement.paymentDueDate > periodEndDate) return null;
				return {
					id: `statement:${statement.id}`,
					kind: 'credit_card_statement',
					impact: 'cash_need',
					title: `Pago de tarjeta ${accountNames.get(statement.accountId) ?? ''}`.trim(),
					date: statement.paymentDueDate,
					amountCents,
					accountId: statement.accountId,
					accountName: accountNames.get(statement.accountId) ?? null,
					accountType: 'credit',
					coveredAmountCents: 0,
					uncoveredAmountCents: 0
				};
			})
			.filter((obligation): obligation is PlanningObligation => obligation !== null)
			.sort(this.compareObligations);
	}

	private loanPaymentObligations(
		loans: LoanSummary[],
		periodStartDate: string,
		periodEndDate: string
	): PlanningObligation[] {
		return loans.flatMap((loan) => {
			if (loan.status !== 'active' || loan.direction !== 'borrowed') return [];
			return loan.installments
				.filter((installment) =>
					installment.remainingAmountCents > 0 &&
					installment.dueDate >= periodStartDate &&
					installment.dueDate <= periodEndDate
				)
				.map((installment): PlanningObligation => ({
					id: `loan:${loan.id}:${installment.number}`,
					kind: 'loan_payment',
					impact: 'cash_need',
					title: `Cuota ${installment.number}: ${loan.name}`,
					date: installment.dueDate,
					amountCents: installment.remainingAmountCents,
					accountId: null,
					accountName: null,
					accountType: null,
					coveredAmountCents: 0,
					uncoveredAmountCents: 0
				}));
		}).sort(this.compareObligations);
	}

	private allocateCash(obligations: PlanningObligation[], availableCashCents: number): PlanningObligation[] {
		let remainingCashCents = availableCashCents;
		return obligations.map((obligation) => {
			const coveredAmountCents = Math.min(obligation.amountCents, remainingCashCents);
			remainingCashCents -= coveredAmountCents;
			return {
				...obligation,
				coveredAmountCents,
				uncoveredAmountCents: obligation.amountCents - coveredAmountCents
			};
		});
	}

	private allocateGoals(goals: FinancialGoal[], freeCashCents: number): PlanningGoalAllocation[] {
		return goals
			.filter((goal) => goal.status === 'active' && goal.distributionPercentage > 0)
			.sort((a, b) => b.distributionPercentage - a.distributionPercentage || a.name.localeCompare(b.name))
			.map((goal) => {
				const remainingAmountCents = remainingGoalAmount(goal);
				const allocatedAmountCents = Math.min(
					remainingAmountCents,
					Math.floor(freeCashCents * goal.distributionPercentage / 100)
				);
				return {
					goalId: goal.id,
					name: goal.name,
					distributionPercentage: goal.distributionPercentage,
					allocatedAmountCents,
					remainingAmountCents
				};
			});
	}

	private sumExistingRealMoney(accounts: Account[]) {
		return sumRealMoneyBalances(accounts);
	}

	private planningAlerts(input: {
		hasFollowingIncome: boolean;
		unassignedRecurringExpenses: PlanningObligation[];
		uncoveredCashObligationsCents: number;
	}) {
		const alerts: string[] = [];
		if (!input.hasFollowingIncome) {
			alerts.push('No se encontró un ingreso posterior; el horizonte usa 30 días como referencia.');
		}
		if (input.unassignedRecurringExpenses.length > 0) {
			alerts.push('Hay gastos recurrentes sin cuenta de pago asignada.');
		}
		if (input.uncoveredCashObligationsCents > 0) {
			alerts.push('El dinero real disponible no cubre todas las obligaciones del periodo.');
		}
		return alerts;
	}

	private emptyNextIncomePlan(input: {
		currencyCode: string;
		generatedAt: string;
		existingRealMoneyCents: number;
		alerts: string[];
	}): NextIncomePlanning {
		return {
			currencyCode: input.currencyCode,
			generatedAt: input.generatedAt,
			period: { startDate: null, endDate: null, hasFollowingIncome: false },
			nextIncome: null,
			existingRealMoneyCents: input.existingRealMoneyCents,
			totalCashAvailableCents: input.existingRealMoneyCents,
			cashObligations: [],
			creditConsumptions: [],
			statementPayments: [],
			unassignedRecurringExpenses: [],
			totalCashObligationsCents: 0,
			totalCreditConsumptionCents: 0,
			totalStatementPaymentsCents: 0,
			coveredCashObligationsCents: 0,
			uncoveredCashObligationsCents: 0,
			freeCashCents: input.existingRealMoneyCents,
			goalAllocations: [],
			remainingFreeCashCents: input.existingRealMoneyCents,
			alerts: input.alerts
		};
	}

	private projectLoanPaymentEvents(loans: LoanSummary[], startsAt: Date, endsAt: Date): DatedAmount[] {
		return loans.flatMap((loan) => {
			if (loan.status !== 'active' || loan.direction !== 'borrowed') return [];

			return loan.installments
				.filter((installment) => {
					if (installment.remainingAmountCents <= 0) return false;
					const dueDate = parseLocalDate(installment.dueDate);
					return Boolean(dueDate && dueDate > startsAt && dueDate <= endsAt);
				})
				.map((installment) => ({
					date: installment.dueDate,
					amountCents: installment.remainingAmountCents
				}));
		});
	}

	private groupAmountsByDate(events: DatedAmount[]) {
		const grouped = new Map<string, number>();
		for (const event of events) grouped.set(event.date, (grouped.get(event.date) ?? 0) + event.amountCents);

		return [...grouped.entries()]
			.map(([date, amountCents]) => ({ date, amountCents }))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	private compareObligations(a: PlanningObligation, b: PlanningObligation) {
		return a.date.localeCompare(b.date) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
	}

	private nextIncomeDateAfter(income: RecurringIncome, date: Date): Date | null {
		return nextRecurringPaymentDate(date, income.paymentSchedule);
	}

	private nextExpenseDateAfter(expense: RecurringExpense, date: Date): Date | null {
		return nextRecurringPaymentDate(date, expense.paymentSchedule, {
			customInterval: {
				count: expense.customIntervalCount,
				unit: expense.customIntervalUnit
			}
		});
	}
}

export const financialPlanningService = new FinancialPlanningService();
