import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { Expense } from '$lib/modules/expenses/types/expense.types';
import type { Movement } from '../../types/movement.types';
import type { MovementFormFeedback } from '../../types/movement-form-feedback.types';

export type ExpenseMovementFormProps = {
	mode: 'create' | 'edit';
	cards: CardListItem[];
	expenses: Expense[];
	categories: Category[];
	movement?: Movement;
	feedback?: MovementFormFeedback | null;
	onBack?: () => void;
	onCancel?: () => void;
};
