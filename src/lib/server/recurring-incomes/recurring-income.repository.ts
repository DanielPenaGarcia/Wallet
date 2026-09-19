import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { CreateRecurringIncomeInput } from './inputs/create-recurring-income.input';
import type { UpdateRecurringIncomeInput } from './inputs/update-recurring-income.input';

export interface RecurringIncomeRepository {
	findById(id: string): Promise<RecurringIncome | undefined>;
	list(): Promise<RecurringIncome[]>;
	create(input: CreateRecurringIncomeInput): Promise<RecurringIncome>;
	update(input: UpdateRecurringIncomeInput): Promise<void>;
	delete(id: string): Promise<void>;
}
