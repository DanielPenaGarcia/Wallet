import type { CreateExpenseInput } from './create-expense.input';

export type UpdateExpenseInput = CreateExpenseInput & {
	id: string;
};
