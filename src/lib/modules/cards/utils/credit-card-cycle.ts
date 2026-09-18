import { lastDayOfMonth, startOfLocalDay } from '$lib/shared/utils/local-date';

function cycleDate(year: number, month: number, dayOfMonth: number) {
	return new Date(year, month, Math.min(dayOfMonth, lastDayOfMonth(year, month)));
}

function statementDueDate(statementDate: Date, statementDay: number, paymentDueDay: number) {
	const dueMonth =
		paymentDueDay > statementDay ? statementDate.getMonth() : statementDate.getMonth() + 1;

	return cycleDate(statementDate.getFullYear(), dueMonth, paymentDueDay);
}

export function latestCreditCardStatementCycle(statementDay: number, referenceDate = new Date()) {
	const today = startOfLocalDay(referenceDate);
	const statementThisMonth = cycleDate(today.getFullYear(), today.getMonth(), statementDay);
	const statementDate =
		today >= statementThisMonth
			? statementThisMonth
			: cycleDate(today.getFullYear(), today.getMonth() - 1, statementDay);
	const previousStatementDate = cycleDate(
		statementDate.getFullYear(),
		statementDate.getMonth() - 1,
		statementDay
	);

	return {
		previousStatementDate,
		statementDate
	};
}

export function openCreditCardStatementCycle(statementDay: number, referenceDate = new Date()) {
	const today = startOfLocalDay(referenceDate);
	const statementThisMonth = cycleDate(today.getFullYear(), today.getMonth(), statementDay);
	const previousStatementDate =
		today >= statementThisMonth
			? statementThisMonth
			: cycleDate(today.getFullYear(), today.getMonth() - 1, statementDay);
	const statementDate =
		today >= statementThisMonth
			? cycleDate(today.getFullYear(), today.getMonth() + 1, statementDay)
			: statementThisMonth;

	return {
		previousStatementDate,
		statementDate
	};
}

export function creditCardPaymentCycle(
	statementDay: number,
	paymentDueDay: number,
	referenceDate = new Date()
) {
	const today = startOfLocalDay(referenceDate);
	const statementThisMonth = cycleDate(today.getFullYear(), today.getMonth(), statementDay);
	const latestStatement =
		today >= statementThisMonth
			? statementThisMonth
			: cycleDate(today.getFullYear(), today.getMonth() - 1, statementDay);
	const latestStatementDueDate = statementDueDate(latestStatement, statementDay, paymentDueDay);
	const statementDate =
		latestStatementDueDate >= today
			? latestStatement
			: cycleDate(latestStatement.getFullYear(), latestStatement.getMonth() + 1, statementDay);
	const previousStatementDate = cycleDate(
		statementDate.getFullYear(),
		statementDate.getMonth() - 1,
		statementDay
	);

	return {
		previousStatementDate,
		statementDate,
		dueDate: statementDueDate(statementDate, statementDay, paymentDueDay)
	};
}
