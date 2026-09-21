import {
	addCustomInterval,
	addDays,
	clampedMonthDate,
	nextMonthlyDate,
	nextSemimonthlyDate,
	nextWeekday,
	nextYearlyDate,
	type RecurrenceIntervalUnit,
	type RecurrenceMonthDay,
	weekDayIndex
} from './recurrence-date';

export type RecurringPaymentWeekday = keyof typeof weekDayIndex;

export type RecurringPaymentSchedule =
	| { type: 'daily' }
	| { type: 'weekly'; weekday: RecurringPaymentWeekday }
	| { type: 'semimonthly'; firstDay: number; secondDay: RecurrenceMonthDay }
	| { type: 'monthly'; day: RecurrenceMonthDay }
	| { type: 'yearly'; month: number; day: RecurrenceMonthDay }
	| { type: 'custom' };

export type RecurringPaymentCustomInterval = {
	count: number | null;
	unit: RecurrenceIntervalUnit | null;
};

export type NextRecurringPaymentDateOptions = {
	monthlyMode?: 'next-due-date' | 'next-period';
	customInterval?: RecurringPaymentCustomInterval;
};

export function nextRecurringPaymentDate(
	date: Date,
	schedule: RecurringPaymentSchedule,
	options: NextRecurringPaymentDateOptions = {}
): Date | null {
	if (schedule.type === 'daily') return addDays(date, 1);
	if (schedule.type === 'weekly') return nextWeekday(date, weekDayIndex[schedule.weekday]);
	if (schedule.type === 'semimonthly') return nextSemimonthlyDate(date, schedule.firstDay, schedule.secondDay);
	if (schedule.type === 'monthly') {
		return options.monthlyMode === 'next-period'
			? clampedMonthDate(date.getFullYear(), date.getMonth() + 1, schedule.day)
			: nextMonthlyDate(date, schedule.day);
	}
	if (schedule.type === 'yearly') return nextYearlyDate(date, schedule.month, schedule.day);
	if (options.customInterval?.count && options.customInterval.unit) {
		return addCustomInterval(date, options.customInterval.count, options.customInterval.unit);
	}

	return null;
}

export function isRecurringPaymentScheduleForFrequency(
	schedule: RecurringPaymentSchedule,
	frequency: RecurringPaymentSchedule['type']
) {
	if (schedule.type !== frequency) return false;
	if (schedule.type === 'daily') return true;
	if (schedule.type === 'weekly') return schedule.weekday in weekDayIndex;
	if (schedule.type === 'semimonthly') {
		return isNumericRecurrenceMonthDay(schedule.firstDay) && isRecurrenceMonthDay(schedule.secondDay);
	}
	if (schedule.type === 'monthly') return isRecurrenceMonthDay(schedule.day);
	if (schedule.type === 'yearly') {
		return Number.isInteger(schedule.month) &&
			schedule.month >= 1 &&
			schedule.month <= 12 &&
			isRecurrenceMonthDay(schedule.day);
	}

	return true;
}

export function isRecurrenceMonthDay(value: RecurrenceMonthDay) {
	return value === 'last' || isNumericRecurrenceMonthDay(value);
}

export function isNumericRecurrenceMonthDay(value: number) {
	return Number.isInteger(value) && value >= 1 && value <= 31;
}
