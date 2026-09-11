import type { Category } from '$lib/modules/categories/types/category.types';
import type { ExpenseFormFeedback } from '../../types/expense-form-feedback.types';

export type CreateExpenseFormProps = {
	categories: Category[];
	feedback?: ExpenseFormFeedback | null;
};
