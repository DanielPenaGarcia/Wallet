import type { Category } from '$lib/modules/categories/types/category.types';
import type { ExpenseFormFeedback } from '../../types/expense-form-feedback.types';
import type { Expense } from '../../types/expense.types';

export type EditExpenseFormProps = {
	expense: Expense;
	categories: Category[];
	feedback?: ExpenseFormFeedback | null;
	onCancel: () => void;
};
