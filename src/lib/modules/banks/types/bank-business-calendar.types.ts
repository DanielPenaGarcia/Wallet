import type { IsoDate } from '$lib/shared/types/date.types';

/** Sigue la numeración de Date#getDay: domingo = 0, sábado = 6. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type NonBusinessDayAdjustment =
	| 'none'
	| 'previous-business-day'
	| 'next-business-day';

export type BankHoliday = {
	date: IsoDate;
	name: string;
};

/** Calendario propio del banco para calcular fechas de corte y pago. */
export type BankBusinessCalendar = {
	timeZone: string;
	weekendDays: readonly Weekday[];
	holidays: readonly BankHoliday[];
};
