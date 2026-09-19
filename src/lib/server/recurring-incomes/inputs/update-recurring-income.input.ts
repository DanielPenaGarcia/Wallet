import type { CreateRecurringIncomeInput } from './create-recurring-income.input';

export type UpdateRecurringIncomeInput = CreateRecurringIncomeInput & {
	id: string;
};
