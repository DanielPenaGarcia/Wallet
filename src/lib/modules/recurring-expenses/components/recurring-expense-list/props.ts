import type { RecurringExpense } from '../../types/recurring-expense.types';

export type RecurringExpenseListProps = {
	expenses: RecurringExpense[];
	onCreate: () => void;
	onEdit: (expense: RecurringExpense) => void;
	onDelete: (expense: RecurringExpense) => void;
};
