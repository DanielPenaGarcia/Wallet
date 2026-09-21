import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { FinancialPlanningPeriod } from '$lib/modules/goals/types/goal-projection.types';
import { toIsoDate } from '$lib/shared/utils/local-date';
import { parseLocalDate, startOfLocalDay } from '$lib/shared/utils/recurrence-date';
import { nextRecurringPaymentDate } from '$lib/shared/utils/recurring-payment-schedule';

const projectionIncomeLimit = 50000;
const projectionYearLimit = 100;

type DatedAmount = {
	date: string;
	amountCents: number;
};

export class FinancialPlanningService {
	projectFreeMoneyPeriods(
		recurringIncomes: RecurringIncome[],
		recurringExpenses: RecurringExpense[],
		from = new Date()
	): FinancialPlanningPeriod[] {
		const startsAt = startOfLocalDay(from);
		const endsAt = new Date(startsAt.getFullYear() + projectionYearLimit, startsAt.getMonth(), startsAt.getDate());
		const incomeEvents = this.projectIncomeEvents(recurringIncomes, startsAt, endsAt);
		if (incomeEvents.length === 0) return [];

		const incomeEventsByDate = this.groupAmountsByDate(incomeEvents).slice(0, projectionIncomeLimit);
		const lastIncomeDate = parseLocalDate(incomeEventsByDate[incomeEventsByDate.length - 1].date) ?? endsAt;
		const expenseEventsByDate = this.groupAmountsByDate(
			this.projectExpenseEvents(recurringExpenses, startsAt, lastIncomeDate)
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
				events.push({ date: toIsoDate(nextDate), amountCents: income.expectedAmountCents });
				nextDate = this.nextIncomeDateAfter(income, nextDate);
			}

			return events;
		});
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

	private groupAmountsByDate(events: DatedAmount[]) {
		const grouped = new Map<string, number>();
		for (const event of events) grouped.set(event.date, (grouped.get(event.date) ?? 0) + event.amountCents);

		return [...grouped.entries()]
			.map(([date, amountCents]) => ({ date, amountCents }))
			.sort((a, b) => a.date.localeCompare(b.date));
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
