import type { RecurringExpenseFormFeedback } from '../../types/recurring-expense-form-feedback.types';
import type { RecurringExpense } from '../../types/recurring-expense.types';

export type DeleteRecurringExpenseFormProps = {
	expense: RecurringExpense;
	feedback?: RecurringExpenseFormFeedback | null;
	onCancel: () => void;
};
