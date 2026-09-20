import { lastDayOfMonth, toIsoDate } from '$lib/shared/utils/local-date';

type CycleInput = {
	statementDay: number;
	referenceDate?: Date | string;
};

type PaymentDueDateInput = {
	statementDate: string;
	paymentDueDay: number;
};

export function effectiveMonthDate(year: number, month: number, day: number) {
	const effectiveDay = Math.min(day, lastDayOfMonth(year, month));
	return new Date(year, month, effectiveDay);
}

export function parseIsoDate(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function getCreditCardCycle({ statementDay, referenceDate = new Date() }: CycleInput) {
	const reference = typeof referenceDate === 'string' ? parseIsoDate(referenceDate) : referenceDate;
	const referenceDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
	const currentMonthStatement = effectiveMonthDate(
		referenceDay.getFullYear(),
		referenceDay.getMonth(),
		statementDay
	);
	const previousStatement = referenceDay >= currentMonthStatement
		? currentMonthStatement
		: effectiveMonthDate(referenceDay.getFullYear(), referenceDay.getMonth() - 1, statementDay);
	const priorStatement = effectiveMonthDate(
		previousStatement.getFullYear(),
		previousStatement.getMonth() - 1,
		statementDay
	);
	const nextStatement = effectiveMonthDate(
		previousStatement.getFullYear(),
		previousStatement.getMonth() + 1,
		statementDay
	);
	const previousPeriodStart = addDays(priorStatement, 1);
	const currentPeriodStart = addDays(previousStatement, 1);

	return {
		previousStatementDate: toIsoDate(previousStatement),
		previousPeriodStart: toIsoDate(previousPeriodStart),
		previousPeriodEnd: toIsoDate(previousStatement),
		currentPeriodStart: toIsoDate(currentPeriodStart),
		currentPeriodEnd: toIsoDate(nextStatement),
		nextStatementDate: toIsoDate(nextStatement)
	};
}

export function getPaymentDueDate({ statementDate, paymentDueDay }: PaymentDueDateInput) {
	const statement = parseIsoDate(statementDate);
	let dueDate = effectiveMonthDate(statement.getFullYear(), statement.getMonth(), paymentDueDay);
	if (dueDate <= statement) {
		dueDate = effectiveMonthDate(statement.getFullYear(), statement.getMonth() + 1, paymentDueDay);
	}

	return toIsoDate(dueDate);
}

function addDays(date: Date, days: number) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
