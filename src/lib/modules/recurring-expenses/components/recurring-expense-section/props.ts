import type { Category } from '$lib/modules/categories/types/category.types';
import type { RecurringExpenseFormFeedback } from '../../types/recurring-expense-form-feedback.types';
import type { RecurringExpense } from '../../types/recurring-expense.types';

export type RecurringExpenseSectionProps = {
	expenses: RecurringExpense[];
	categories: Category[];
	feedback?: RecurringExpenseFormFeedback | null;
};
