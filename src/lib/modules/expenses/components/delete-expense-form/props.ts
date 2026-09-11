import type { ExpenseFormFeedback } from '../../types/expense-form-feedback.types';
import type { Expense } from '../../types/expense.types';

export type DeleteExpenseFormProps = {
	expense: Expense;
	feedback?: ExpenseFormFeedback | null;
	onCancel: () => void;
};
