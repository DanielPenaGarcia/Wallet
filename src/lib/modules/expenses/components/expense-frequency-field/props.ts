import type { ExpenseFrequency, ExpenseIntervalUnit } from '../../types/expense.types';

export type ExpenseFrequencyFieldProps = {
	idPrefix: string;
	frequency: ExpenseFrequency;
	customIntervalCount: string;
	customIntervalUnit: ExpenseIntervalUnit | '';
	frequencyError?: string;
	customIntervalCountError?: string;
	customIntervalUnitError?: string;
};
