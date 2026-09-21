import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { Movement } from '../../types/movement.types';
import type { MovementFormFeedback } from '../../types/movement-form-feedback.types';

export type IncomeMovementFormProps = {
	mode: 'create' | 'edit';
	cards: CardListItem[];
	incomes: RecurringIncome[];
	movement?: Movement;
	feedback?: MovementFormFeedback | null;
	onBack?: () => void;
	onCancel?: () => void;
};
