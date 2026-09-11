import type { JobIncome } from '../types/job-income.types';
import type { NextIncomePayment } from '../types/next-income-payment.types';
import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
import { startOfLocalDay, toIsoDate } from '$lib/shared/utils/local-date';
import {
	nextPaymentDateForIncome,
	paymentAmountForIncome
} from './income-payment-schedule';
import { getIncomePaymentCadenceLabel } from './income-payment-frequency-options';

const weekdayFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'long' });
const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long' });
function formatDateLabel(date: Date) {
	return `${weekdayFormatter.format(date)} ${date.getDate()} de ${monthFormatter.format(date)}`;
}

function cadenceLabelForDate(incomes: JobIncome[], dateIso: string, today: Date) {
	const frequencies = new Set(
		incomes
			.filter((income) => toIsoDate(nextPaymentDateForIncome(income, today)) === dateIso)
			.map((income) => income.paymentFrequency)
	);

	if (frequencies.has('semimonthly')) return 'Quincena';
	if (frequencies.has('monthly')) return getIncomePaymentCadenceLabel('monthly');
	return getIncomePaymentCadenceLabel('weekly');
}

export function getNextIncomePayment(
	incomes: JobIncome[],
	referenceDate = new Date()
): NextIncomePayment | null {
	const activeIncomes = incomes.filter((income) => income.active);
	if (activeIncomes.length === 0) return null;

	const today = startOfLocalDay(referenceDate);
	const paymentDates = activeIncomes.map((income) => nextPaymentDateForIncome(income, today));
	const nextDate = paymentDates.reduce((earliest, date) => (date < earliest ? date : earliest));
	const dateIso = toIsoDate(nextDate);
	const incomesDue = activeIncomes.filter(
		(income) => toIsoDate(nextPaymentDateForIncome(income, today)) === dateIso
	);
	const incomeCount = incomesDue.length;
	const currencyCode = incomesDue[0]?.currencyCode ?? 'MXN';
	const sameCurrency = incomesDue.every((income) => income.currencyCode === currencyCode);
	const amount = sameCurrency
		? incomesDue.reduce((total, income) => total + paymentAmountForIncome(income), 0)
		: 0;

	return {
		dateIso,
		dateLabel: formatDateLabel(nextDate),
		cadenceLabel: cadenceLabelForDate(activeIncomes, dateIso, today),
		incomeCount,
		amount,
		currencyCode,
		amountLabel: sameCurrency
			? formatCurrencyFromMinorUnits(amount, currencyCode)
			: 'Varias monedas'
	};
}
