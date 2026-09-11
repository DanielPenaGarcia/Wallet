import type { DashboardSummary } from '$lib/modules/dashboard/types/dashboard-summary.types';
import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Expense } from '$lib/modules/expenses/types/expense.types';
import { formatExpenseAmount } from '$lib/modules/expenses/utils/format-expense-amount';
import { getExpenseFrequencyLabel } from '$lib/modules/expenses/utils/expense-form-options';
import { getNextIncomePayment } from '$lib/modules/incomes/utils/next-income-payment';
import {
	lastSemimonthlyPaymentDay,
	listIncomePaymentDatesThrough,
	paymentAmountForIncome,
} from '$lib/modules/incomes/utils/income-payment-schedule';
import type { JobIncome } from '$lib/modules/incomes/types/job-income.types';
import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
import { lastDayOfMonth, startOfLocalDay, toIsoDate } from '$lib/shared/utils/local-date';
import { getCards } from '$lib/server/modules/cards/card.service';
import { getExpenses } from '$lib/server/modules/expenses/expense.service';
import { getJobIncomes } from '$lib/server/modules/incomes/income.service';
import {
	listReserveMovementsForCycles,
	type ReserveMovementRecord
} from '$lib/server/modules/reserves/reserve.repository';

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
	weekday: 'long',
	day: 'numeric',
	month: 'long'
});

function clampDay(year: number, month: number, day: number) {
	return Math.min(day, lastDayOfMonth(year, month));
}

function addInterval(date: Date, expense: Expense) {
	const nextDate = new Date(date);

	if (expense.frequency === 'daily') {
		nextDate.setDate(date.getDate() + 1);
		return nextDate;
	}

	if (expense.frequency === 'weekly') {
		nextDate.setDate(date.getDate() + 7);
		return nextDate;
	}

	if (expense.frequency === 'semimonthly') {
		if (date.getDate() <= 15) {
			return new Date(
				date.getFullYear(),
				date.getMonth(),
				lastSemimonthlyPaymentDay(date.getFullYear(), date.getMonth())
			);
		}
		return new Date(date.getFullYear(), date.getMonth() + 1, 15);
	}

	if (expense.frequency === 'yearly') {
		return new Date(
			date.getFullYear() + 1,
			date.getMonth(),
			clampDay(date.getFullYear() + 1, date.getMonth(), date.getDate())
		);
	}

	if (expense.frequency === 'custom' && expense.customIntervalCount && expense.customIntervalUnit) {
		if (expense.customIntervalUnit === 'days') {
			nextDate.setDate(date.getDate() + expense.customIntervalCount);
			return nextDate;
		}

		if (expense.customIntervalUnit === 'weeks') {
			nextDate.setDate(date.getDate() + expense.customIntervalCount * 7);
			return nextDate;
		}

		if (expense.customIntervalUnit === 'months') {
			return new Date(
				date.getFullYear(),
				date.getMonth() + expense.customIntervalCount,
				clampDay(date.getFullYear(), date.getMonth() + expense.customIntervalCount, date.getDate())
			);
		}

		return new Date(
			date.getFullYear() + expense.customIntervalCount,
			date.getMonth(),
			clampDay(date.getFullYear() + expense.customIntervalCount, date.getMonth(), date.getDate())
		);
	}

	return new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		clampDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
	);
}

function dueDateFromAnchor(anchor: Date, expense: Expense) {
	const anchorDate = startOfLocalDay(anchor);
	const dueDay = expense.paymentDueDay ?? anchorDate.getDate();

	if (expense.frequency === 'one_time') return anchorDate;
	if (expense.frequency === 'daily' || expense.frequency === 'weekly') return anchorDate;

	if (expense.frequency === 'semimonthly') {
		const day =
			anchorDate.getDate() <= 15
				? 15
				: lastSemimonthlyPaymentDay(anchorDate.getFullYear(), anchorDate.getMonth());
		return new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day);
	}

	return new Date(
		anchorDate.getFullYear(),
		anchorDate.getMonth(),
		clampDay(anchorDate.getFullYear(), anchorDate.getMonth(), dueDay)
	);
}

function nextUnpaidDueDate(expense: Expense, today: Date) {
	const dueDay = expense.paymentDueDay ?? today.getDate();

	if (
		expense.frequency === 'custom' &&
		expense.customIntervalUnit === 'months' &&
		expense.customIntervalCount !== null &&
		expense.customIntervalCount > 1
	) {
		const nextDueMonth =
			today.getDate() <= dueDay
				? today.getMonth() + expense.customIntervalCount - 1
				: today.getMonth() + expense.customIntervalCount;
		return new Date(
			today.getFullYear(),
			nextDueMonth,
			clampDay(today.getFullYear(), nextDueMonth, dueDay)
		);
	}

	return dueDateFromAnchor(today, expense);
}

function nextDueDate(expense: Expense, today: Date) {
	const latestPayment = expense.paymentHistory[0];
	if (!latestPayment) {
		let dueDate = nextUnpaidDueDate(expense, today);
		let guard = 0;

		while (dueDate < today && guard < 260) {
			dueDate = dueDateFromAnchor(addInterval(dueDate, expense), expense);
			guard += 1;
		}

		return dueDate;
	}

	if (expense.frequency === 'one_time') return null;

	const paidCycleDueDate = dueDateFromAnchor(new Date(latestPayment.paidAt), expense);
	let dueDate = dueDateFromAnchor(addInterval(paidCycleDueDate, expense), expense);
	let guard = 0;

	while (dueDate < today && guard < 260) {
		dueDate = dueDateFromAnchor(addInterval(dueDate, expense), expense);
		guard += 1;
	}

	return dueDate;
}

function currentCycleDueDate(expense: Expense, today: Date) {
	const latestPayment = expense.paymentHistory[0];
	if (expense.frequency === 'one_time' && latestPayment) {
		return dueDateFromAnchor(new Date(latestPayment.paidAt), expense);
	}

	return nextUnpaidDueDate(expense, today);
}

function isCurrentCyclePaid(expense: Expense, dueDate: Date) {
	const latestPayment = expense.paymentHistory[0];
	if (!latestPayment) return false;
	if (expense.frequency === 'one_time') return true;

	const paidCycleDueDate = dueDateFromAnchor(new Date(latestPayment.paidAt), expense);
	return paidCycleDueDate >= dueDate;
}

function monthlyReserveDivisor(expense: Expense) {
	if (
		expense.frequency === 'custom' &&
		expense.customIntervalUnit === 'months' &&
		expense.customIntervalCount !== null &&
		expense.customIntervalCount > 1
	) {
		return expense.customIntervalCount;
	}

	if (
		expense.frequency === 'custom' &&
		expense.customIntervalUnit === 'years' &&
		expense.customIntervalCount !== null &&
		expense.customIntervalCount > 0
	) {
		return expense.customIntervalCount * 12;
	}

	if (expense.frequency === 'yearly') return 12;

	return 1;
}

function semimonthlyReserveAmount(monthlyReserveAmount: number, dueDate: Date, today: Date) {
	const dueDateIsThisMonth =
		dueDate.getFullYear() === today.getFullYear() && dueDate.getMonth() === today.getMonth();
	const lastSemimonthDate = new Date(
		today.getFullYear(),
		today.getMonth(),
		lastSemimonthlyPaymentDay(today.getFullYear(), today.getMonth())
	);

	if (dueDateIsThisMonth && dueDate < lastSemimonthDate) {
		return monthlyReserveAmount;
	}

	return Math.ceil(monthlyReserveAmount / 2);
}

function currentIncomeAmount(incomes: JobIncome[], dateIso: string, currencyCode: string) {
	const paymentDate = new Date(`${dateIso}T00:00:00`);

	return incomes
		.filter((income) => income.active && income.currencyCode === currencyCode)
		.filter((income) =>
			listIncomePaymentDatesThrough([income], paymentDate, paymentDate).some(
				(date) => toIsoDate(date) === dateIso
			)
		)
		.reduce((total, income) => total + paymentAmountForIncome(income), 0);
}

function nextCreditCardDueDate(paymentDueDay: number, today: Date) {
	const year = today.getFullYear();
	const month = today.getMonth();
	const dueDateThisMonth = new Date(year, month, clampDay(year, month, paymentDueDay));

	if (dueDateThisMonth >= today) return dueDateThisMonth;

	return new Date(year, month + 1, clampDay(year, month + 1, paymentDueDay));
}

function listSemimonthlyDatesThrough(startDate: Date, endDate: Date) {
	const dates: Date[] = [];
	const start = startOfLocalDay(startDate);
	const end = startOfLocalDay(endDate);
	let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
	let guard = 0;

	while (cursor <= end && guard < 60) {
		const fifteenth = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
		const lastSemimonth = new Date(
			cursor.getFullYear(),
			cursor.getMonth(),
			lastSemimonthlyPaymentDay(cursor.getFullYear(), cursor.getMonth())
		);

		for (const date of [fifteenth, lastSemimonth]) {
			if (date >= start && date <= end) dates.push(date);
		}

		cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
		guard += 1;
	}

	return dates.sort((left, right) => left.getTime() - right.getTime());
}

function reservedAmount(
	reserveMovements: ReserveMovementRecord[],
	input: {
		reserveKind: ReserveMovementRecord['reserveKind'];
		targetId: string;
		cycleDueOn: string;
		currencyCode: string;
	}
) {
	return reserveMovements
		.filter(
			(reserveMovement) =>
				reserveMovement.reserveKind === input.reserveKind &&
				reserveMovement.targetId === input.targetId &&
				reserveMovement.cycleDueOn === input.cycleDueOn &&
				reserveMovement.currencyCode === input.currencyCode
		)
		.reduce((total, reserveMovement) => total + reserveMovement.amount, 0);
}

function creditCardReserve(
	card: CardListItem,
	today: Date,
	reserveMovements: ReserveMovementRecord[]
) {
	if (card.kind !== 'credit' || card.paymentDueDay === null) return null;

	const cashExpenseAmount = card.cashExpenseAmount ?? 0;
	const nextInterestFreeInstallmentsAmount = card.interestFreeInstallmentPurchases.reduce(
		(total, purchase) => {
			const nextInstallment = purchase.installments.find((installment) => !installment.paid);
			return total + (nextInstallment?.amount ?? 0);
		},
		0
	);
	const payableAmount = cashExpenseAmount + nextInterestFreeInstallmentsAmount;
	if (payableAmount <= 0) return null;

	const dueDate = nextCreditCardDueDate(card.paymentDueDay, today);
	const nextDueDateIso = toIsoDate(dueDate);
	const semimonthsUntilDue = Math.max(listSemimonthlyDatesThrough(today, dueDate).length, 1);
	const reserveAmount = Math.max(
		Math.ceil(payableAmount / semimonthsUntilDue) -
			reservedAmount(reserveMovements, {
				reserveKind: 'credit',
				targetId: card.id,
				cycleDueOn: nextDueDateIso,
				currencyCode: card.currencyCode
			}),
		0
	);

	return {
		cardId: card.id,
		alias: card.alias,
		bankName: card.bankName,
		lastFourDigits: card.lastFourDigits,
		payableAmount,
		payableAmountLabel: formatCurrencyFromMinorUnits(payableAmount, card.currencyCode),
		cashExpenseAmount,
		cashExpenseAmountLabel: formatCurrencyFromMinorUnits(cashExpenseAmount, card.currencyCode),
		nextInterestFreeInstallmentsAmount,
		nextInterestFreeInstallmentsAmountLabel: formatCurrencyFromMinorUnits(
			nextInterestFreeInstallmentsAmount,
			card.currencyCode
		),
		nextDueDateIso,
		nextDueDateLabel: dateFormatter.format(dueDate),
		semimonthsUntilDue,
		reserveAmount,
		reserveAmountLabel: formatCurrencyFromMinorUnits(reserveAmount, card.currencyCode),
		currencyCode: card.currencyCode
	};
}

function debitBalanceTotal(cards: CardListItem[], currencyCode: string) {
	return cards
		.filter((card) => card.kind === 'debit' && card.currencyCode === currencyCode)
		.reduce((total, card) => total + card.currentBalance, 0);
}

export async function getDashboardSummary(referenceDate = new Date()): Promise<DashboardSummary> {
	const [expenses, incomes, cards] = await Promise.all([
		getExpenses(),
		getJobIncomes(),
		getCards()
	]);
	const today = startOfLocalDay(referenceDate);
	const nextIncomePayment = getNextIncomePayment(incomes, today);
	const currencyCode = nextIncomePayment?.currencyCode ?? expenses[0]?.currencyCode ?? cards[0]?.currencyCode ?? 'MXN';
	const expenseDueDates = new Map(
		expenses.map((expense) => [expense.id, currentCycleDueDate(expense, today)])
	);
	const creditDueDates = cards
		.filter((card) => card.kind === 'credit' && card.paymentDueDay !== null)
		.map((card) => nextCreditCardDueDate(card.paymentDueDay ?? 1, today));
	const reserveMovements = await listReserveMovementsForCycles([
		...Array.from(expenseDueDates.values()).map(toIsoDate),
		...creditDueDates.map(toIsoDate)
	]);

	const reserves = expenses.map((expense) => {
		const dueDate = expenseDueDates.get(expense.id) ?? currentCycleDueDate(expense, today);
		const nextDueDateIso = toIsoDate(dueDate);
		const incomePaymentDates = listIncomePaymentDatesThrough(incomes, today, dueDate);
		const paymentsUntilDue = Math.max(incomePaymentDates.length, 1);
		const rawMonthlyReserveAmount = Math.ceil(expense.amount / monthlyReserveDivisor(expense));
		const monthlyReserveAmount = Math.max(
			rawMonthlyReserveAmount -
				reservedAmount(reserveMovements, {
					reserveKind: 'monthly',
					targetId: expense.id,
					cycleDueOn: nextDueDateIso,
					currencyCode: expense.currencyCode
				}),
			0
		);
		const rawReserveAmount = semimonthlyReserveAmount(rawMonthlyReserveAmount, dueDate, today);
		const reserveAmount = Math.max(
			rawReserveAmount -
				reservedAmount(reserveMovements, {
					reserveKind: 'semimonthly',
					targetId: expense.id,
					cycleDueOn: nextDueDateIso,
					currencyCode: expense.currencyCode
				}),
			0
		);
		const status: 'paid' | 'pending' = isCurrentCyclePaid(expense, dueDate) ? 'paid' : 'pending';

		return {
			expenseId: expense.id,
			name: expense.name,
			categoryName: expense.categoryName,
			categoryColor: expense.categoryColor,
			amountKind: expense.amountKind,
			amountLabel: formatExpenseAmount(expense.amount, expense.currencyCode, expense.amountKind),
			frequencyLabel: getExpenseFrequencyLabel(
				expense.frequency,
				expense.customIntervalCount,
				expense.customIntervalUnit
			),
			nextDueDateIso,
			nextDueDateLabel: dateFormatter.format(dueDate),
			paymentsUntilDue,
			reserveAmount,
			reserveAmountLabel: formatCurrencyFromMinorUnits(reserveAmount, expense.currencyCode),
			monthlyReserveAmount,
			monthlyReserveAmountLabel: formatCurrencyFromMinorUnits(
				monthlyReserveAmount,
				expense.currencyCode
			),
			status,
			statusLabel: status === 'paid' ? 'Pagado' : 'Pendiente',
			currencyCode: expense.currencyCode
		};
	});
	const semimonthlyReserves = reserves.filter((reserve) => reserve.status === 'pending');

	const reserveTotal = semimonthlyReserves
		.filter((reserve) => reserve.currencyCode === currencyCode)
		.reduce((total, reserve) => total + reserve.reserveAmount, 0);
	const creditCardReserves = cards
		.map((card) => creditCardReserve(card, today, reserveMovements))
		.filter((reserve) => reserve !== null);
	const creditCardReserveTotal = creditCardReserves
		.filter((reserve) => reserve.currencyCode === currencyCode)
		.reduce((total, reserve) => total + reserve.reserveAmount, 0);
	const totalReserve = reserveTotal + creditCardReserveTotal;
	const currentDebitBalance = debitBalanceTotal(cards, currencyCode);
	const reserveAfterDebit = Math.max(totalReserve - currentDebitBalance, 0);
	const nextIncomeAmount =
		nextIncomePayment === null ? 0 : currentIncomeAmount(incomes, nextIncomePayment.dateIso, currencyCode);
	const availableAfterReserve =
		nextIncomePayment === null || nextIncomePayment.amountLabel === 'Varias monedas'
			? null
			: nextIncomeAmount - reserveAfterDebit;

	return {
		nextIncomeDateLabel: nextIncomePayment?.dateLabel ?? null,
		nextIncomeAmountLabel: nextIncomePayment?.amountLabel ?? null,
		reserveTotal: reserveAfterDebit,
		reserveTotalLabel: formatCurrencyFromMinorUnits(reserveAfterDebit, currencyCode),
		debitBalanceTotal: currentDebitBalance,
		debitBalanceTotalLabel: formatCurrencyFromMinorUnits(currentDebitBalance, currencyCode),
		availableAfterReserve,
		availableAfterReserveLabel:
			availableAfterReserve === null
				? null
				: formatCurrencyFromMinorUnits(availableAfterReserve, currencyCode),
		currencyCode,
		expenseCount: reserves.length,
		estimatedExpenseCount: reserves.filter((reserve) => reserve.amountKind === 'estimated').length,
		reserves: reserves.sort((left, right) => {
			if (left.status !== right.status) return left.status === 'pending' ? -1 : 1;
			return right.monthlyReserveAmount - left.monthlyReserveAmount;
		}),
		semimonthlyReserves: semimonthlyReserves.sort(
			(left, right) => right.reserveAmount - left.reserveAmount
		),
		creditCardReserves: creditCardReserves.sort(
			(left, right) => right.reserveAmount - left.reserveAmount
		)
	};
}
