import type {
	IncomeFrequency,
	IncomeSource,
	WorkSchedule
} from './recurring-income.types';

export type RecurringIncomeFormValues = {
	id?: string;
	title?: string;
	expectedAmount?: string;
	source?: IncomeSource;
	frequency?: IncomeFrequency;
	weeklyDay?: string;
	semimonthlyFirstDay?: string;
	semimonthlySecondDay?: string;
	monthlyDay?: string;
	workSchedule?: string;
	parsedWorkSchedule?: WorkSchedule | null;
	isActive?: boolean;
};

export type RecurringIncomeFormFeedback = {
	action: 'create-recurring-income' | 'update-recurring-income' | 'delete-recurring-income';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: RecurringIncomeFormValues;
};
