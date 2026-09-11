import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { ExpenseFormFeedback, PayExpenseFormValues } from '../../types/expense-form-feedback.types';
import type { Expense } from '../../types/expense.types';

export type PayExpenseFormProps = {
	expense: Expense;
	cards: CardListItem[];
	feedback?: ExpenseFormFeedback | null;
	onCancel: () => void;
};

export function isPayExpenseFormValues(
	values: ExpenseFormFeedback['values']
): values is Partial<PayExpenseFormValues> {
	return Boolean(values && 'expenseId' in values && 'mode' in values);
}
