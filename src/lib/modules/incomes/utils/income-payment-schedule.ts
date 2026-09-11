import type { JobIncome } from '../types/job-income.types';
import { lastDayOfMonth, startOfLocalDay, toIsoDate } from '$lib/shared/utils/local-date';

export { lastDayOfMonth, startOfLocalDay, toIsoDate };

export function lastSemimonthlyPaymentDay(year: number, month: number) {
	return Math.min(30, lastDayOfMonth(year, month));
}

function nextWeeklyPaymentDate(today: Date) {
	const friday = 5;
	const daysUntilFriday = (friday - today.getDay() + 7) % 7;
	const nextDate = new Date(today);
	nextDate.setDate(today.getDate() + daysUntilFriday);
	return nextDate;
}

function nextSemimonthlyPaymentDate(today: Date) {
	const year = today.getFullYear();
	const month = today.getMonth();
	const day = today.getDate();
	const monthLastPaymentDay = lastSemimonthlyPaymentDay(year, month);

	if (day <= 15) return new Date(year, month, 15);
	return new Date(year, month, monthLastPaymentDay);
}

function nextMonthlyPaymentDate(today: Date) {
	const year = today.getFullYear();
	const month = today.getMonth();
	const day = today.getDate();
	const monthLastDay = lastDayOfMonth(year, month);

	if (day <= monthLastDay) return new Date(year, month, monthLastDay);
	return new Date(year, month + 1, lastDayOfMonth(year, month + 1));
}

export function nextPaymentDateForIncome(income: JobIncome, today: Date) {
	if (income.paymentFrequency === 'weekly') return nextWeeklyPaymentDate(today);
	if (income.paymentFrequency === 'monthly') return nextMonthlyPaymentDate(today);
	return nextSemimonthlyPaymentDate(today);
}

export function paymentAmountForIncome(income: JobIncome) {
	if (income.paymentFrequency === 'weekly') return Math.round((income.monthlyAmount * 12) / 52);
	if (income.paymentFrequency === 'semimonthly') return Math.round(income.monthlyAmount / 2);
	return income.monthlyAmount;
}

function addOnePaymentPeriod(date: Date, frequency: JobIncome['paymentFrequency']) {
	if (frequency === 'weekly') {
		const nextDate = new Date(date);
		nextDate.setDate(date.getDate() + 7);
		return nextDate;
	}

	if (frequency === 'monthly') {
		return new Date(
			date.getFullYear(),
			date.getMonth() + 1,
			lastDayOfMonth(date.getFullYear(), date.getMonth() + 1)
		);
	}

	if (date.getDate() <= 15) {
		return new Date(
			date.getFullYear(),
			date.getMonth(),
			lastSemimonthlyPaymentDay(date.getFullYear(), date.getMonth())
		);
	}

	return new Date(date.getFullYear(), date.getMonth() + 1, 15);
}

export function listIncomePaymentDatesThrough(
	incomes: JobIncome[],
	startDate: Date,
	endDate: Date
) {
	const dates = new Map<string, Date>();
	const start = startOfLocalDay(startDate);
	const end = startOfLocalDay(endDate);

	for (const income of incomes.filter((item) => item.active)) {
		let date = nextPaymentDateForIncome(income, start);
		let guard = 0;

		while (date <= end && guard < 260) {
			dates.set(toIsoDate(date), date);
			date = addOnePaymentPeriod(date, income.paymentFrequency);
			guard += 1;
		}
	}

	return [...dates.values()].sort((left, right) => left.getTime() - right.getTime());
}
