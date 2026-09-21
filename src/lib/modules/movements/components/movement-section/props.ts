import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { Expense } from '$lib/modules/expenses/types/expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { Movement } from '../../types/movement.types';
import type { MovementFormFeedback } from '../../types/movement-form-feedback.types';

export type MovementSectionProps = {
	movements: Movement[];
	cards: CardListItem[];
	expenses: Expense[];
	incomes: RecurringIncome[];
	categories: Category[];
	filters: {
		startDate: string;
		endDate: string;
		cardId: string;
		categoryId: string;
		type: string;
	};
	feedback?: MovementFormFeedback | null;
};
