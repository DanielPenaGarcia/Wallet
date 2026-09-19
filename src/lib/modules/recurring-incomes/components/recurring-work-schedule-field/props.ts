import type { WorkSchedule } from '../../types/recurring-income.types';

export type RecurringWorkScheduleFieldProps = {
	idPrefix: string;
	value?: WorkSchedule | null;
	error?: string;
};
