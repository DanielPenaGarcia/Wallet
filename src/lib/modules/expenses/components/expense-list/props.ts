import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { ExpenseFormFeedback } from '../../types/expense-form-feedback.types';
import type { Expense } from '../../types/expense.types';

export type ExpenseListProps = {
	expenses: Expense[];
	categories: Category[];
	cards: CardListItem[];
	feedback?: ExpenseFormFeedback | null;
	onCreate: () => void;
};
