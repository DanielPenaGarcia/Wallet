import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { Expense } from '$lib/modules/expenses/types/expense.types';
import type { MovementFormFeedback, MovementFormValues } from '../../types/movement-form-feedback.types';

export type BulkMovementFormProps = {
	cards: CardListItem[];
	expenses: Expense[];
	categories: Category[];
	feedback?: MovementFormFeedback | null;
};

export type BulkMovementDraft = Required<Pick<MovementFormValues, 'type'>> & MovementFormValues & {
	id: string;
};
