import type {
	IncomeFrequency,
	IncomeSource,
	PaymentSchedule,
	WorkDay,
	WorkSchedule
} from '../types/recurring-income.types';

export const incomeSourceOptions: { value: IncomeSource; label: string }[] = [
	{ value: 'work', label: 'Trabajo' },
	{ value: 'business', label: 'Negocio' },
	{ value: 'support', label: 'Apoyo' },
	{ value: 'rent', label: 'Renta' },
	{ value: 'other', label: 'Otro' }
];

export const incomeFrequencyOptions: { value: IncomeFrequency; label: string }[] = [
	{ value: 'daily', label: 'Diario' },
	{ value: 'weekly', label: 'Semanal' },
	{ value: 'semimonthly', label: 'Quincenal' },
	{ value: 'monthly', label: 'Mensual' }
];

export const workDayOptions: { value: WorkDay; label: string; shortLabel: string }[] = [
	{ value: 'monday', label: 'Lunes', shortLabel: 'L' },
	{ value: 'tuesday', label: 'Martes', shortLabel: 'M' },
	{ value: 'wednesday', label: 'Miércoles', shortLabel: 'X' },
	{ value: 'thursday', label: 'Jueves', shortLabel: 'J' },
	{ value: 'friday', label: 'Viernes', shortLabel: 'V' },
	{ value: 'saturday', label: 'Sábado', shortLabel: 'S' },
	{ value: 'sunday', label: 'Domingo', shortLabel: 'D' }
];

export function getIncomeSourceLabel(source: IncomeSource) {
	return incomeSourceOptions.find((option) => option.value === source)?.label ?? source;
}

export function getIncomeFrequencyLabel(frequency: IncomeFrequency) {
	return incomeFrequencyOptions.find((option) => option.value === frequency)?.label ?? frequency;
}

export function formatRecurringIncomeAmount(amountCents: number) {
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN'
	}).format(amountCents / 100);
}

export function formatPaymentSchedule(paymentSchedule: PaymentSchedule) {
	if (paymentSchedule.type === 'daily') return 'Cada día';
	if (paymentSchedule.type === 'weekly') return workDayLabel(paymentSchedule.weekday);
	if (paymentSchedule.type === 'monthly') return `Día ${formatMonthDay(paymentSchedule.day)}`;
	return `Días ${paymentSchedule.firstDay} y ${formatMonthDay(paymentSchedule.secondDay)}`;
}

export function formatWorkScheduleSummary(workSchedule: WorkSchedule | null) {
	if (!workSchedule) return 'Sin horario';

	const activeDays = workDayOptions.filter((day) => (workSchedule[day.value]?.length ?? 0) > 0);
	if (activeDays.length === 0) return 'Sin horario';

	return activeDays
		.map((day) => `${day.label}: ${workSchedule[day.value]?.map((block) => `${block.startsAt}-${block.endsAt}`).join(', ')}`)
		.join(' · ');
}

function workDayLabel(day: WorkDay) {
	return workDayOptions.find((option) => option.value === day)?.label ?? day;
}

function formatMonthDay(day: number | 'last') {
	return day === 'last' ? 'último del mes' : String(day);
}
