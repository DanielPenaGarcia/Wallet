import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { CreateRecurringExpenseInput } from './inputs/create-recurring-expense.input';
import type { UpdateRecurringExpenseInput } from './inputs/update-recurring-expense.input';

export interface RecurringExpenseRepository {
	findById(id: string): Promise<RecurringExpense | undefined>;
	list(): Promise<RecurringExpense[]>;
	create(input: CreateRecurringExpenseInput): Promise<RecurringExpense>;
	update(input: UpdateRecurringExpenseInput): Promise<void>;
	delete(id: string): Promise<void>;
}
