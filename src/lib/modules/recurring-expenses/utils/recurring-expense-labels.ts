import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
import {
	expenseAmountKindOptions,
	expenseFrequencyOptions,
	expenseIntervalUnitOptions,
	getExpenseFrequencyLabel
} from '$lib/modules/expenses/utils/expense-form-options';
import type { ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
import {
	recurringExpenseFrequencies,
	type RecurringExpense,
	type RecurringExpenseFrequency,
	type RecurringExpensePaymentSchedule,
	type WeekDay
} from '../types/recurring-expense.types';

export const recurringExpenseFrequencyOptions = expenseFrequencyOptions.filter((option) =>
	recurringExpenseFrequencies.includes(option.value as RecurringExpenseFrequency)
) as Array<{ value: RecurringExpenseFrequency; label: string }>;

export const recurringExpenseAmountKindOptions = expenseAmountKindOptions;
export const recurringExpenseIntervalUnitOptions = expenseIntervalUnitOptions;

export const weekDayOptions: Array<{ value: WeekDay; label: string }> = [
	{ value: 'monday', label: 'Lunes' },
	{ value: 'tuesday', label: 'Martes' },
	{ value: 'wednesday', label: 'Miércoles' },
	{ value: 'thursday', label: 'Jueves' },
	{ value: 'friday', label: 'Viernes' },
	{ value: 'saturday', label: 'Sábado' },
	{ value: 'sunday', label: 'Domingo' }
];

export const monthOptions = [
	{ value: '1', label: 'Enero' },
	{ value: '2', label: 'Febrero' },
	{ value: '3', label: 'Marzo' },
	{ value: '4', label: 'Abril' },
	{ value: '5', label: 'Mayo' },
	{ value: '6', label: 'Junio' },
	{ value: '7', label: 'Julio' },
	{ value: '8', label: 'Agosto' },
	{ value: '9', label: 'Septiembre' },
	{ value: '10', label: 'Octubre' },
	{ value: '11', label: 'Noviembre' },
	{ value: '12', label: 'Diciembre' }
];

export const monthDayOptions = [
	{ value: 'last', label: 'Último día' },
	...Array.from({ length: 31 }, (_, index) => ({
		value: String(index + 1),
		label: String(index + 1)
	}))
];

export function getRecurringExpenseFrequencyLabel(expense: Pick<RecurringExpense, 'frequency' | 'customIntervalCount' | 'customIntervalUnit'>) {
	return getExpenseFrequencyLabel(
		expense.frequency,
		expense.customIntervalCount,
		expense.customIntervalUnit as ExpenseIntervalUnit | null
	);
}

export function getRecurringExpenseAmountKindLabel(value: RecurringExpense['amountKind']) {
	return recurringExpenseAmountKindOptions.find((option) => option.value === value)?.label ?? value;
}

export function formatRecurringExpenseAmount(amountCents: number) {
	return formatCurrencyFromMinorUnits(amountCents, 'MXN');
}

export function formatPaymentSchedule(schedule: RecurringExpensePaymentSchedule) {
	if (schedule.type === 'daily') return 'Cada día';
	if (schedule.type === 'weekly') {
		return weekDayOptions.find((day) => day.value === schedule.weekday)?.label ?? 'Semanal';
	}
	if (schedule.type === 'semimonthly') {
		return `Días ${schedule.firstDay} y ${formatMonthDay(schedule.secondDay)}`;
	}
	if (schedule.type === 'monthly') return `Día ${formatMonthDay(schedule.day)}`;
	if (schedule.type === 'yearly') {
		const month = monthOptions.find((option) => option.value === String(schedule.month))?.label ?? 'Mes';
		return `${formatMonthDay(schedule.day)} de ${month}`;
	}
	return 'Según intervalo';
}

export function formatMonthDay(day: number | 'last') {
	return day === 'last' ? 'último' : String(day);
}

export function formatIsoDate(value: string | null) {
	if (!value) return 'Sin fecha';
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return value;
	return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(year, month - 1, day));
}
