import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Movement } from '../../types/movement.types';
import type { MovementFormFeedback } from '../../types/movement-form-feedback.types';

export type AdjustmentMovementFormProps = {
	mode: 'create' | 'edit';
	cards: CardListItem[];
	movement?: Movement;
	feedback?: MovementFormFeedback | null;
	onBack?: () => void;
	onCancel?: () => void;
};
