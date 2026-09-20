import type { CreateRecurringExpenseInput } from './create-recurring-expense.input';

export type UpdateRecurringExpenseInput = CreateRecurringExpenseInput & {
	id: string;
};
