import type { CardFormFeedback } from '../../types/card-form-feedback.types';
import type { CardListItem } from '../../types/card-list-item.types';

export type DeleteCardFormProps = {
	card: CardListItem;
	feedback?: CardFormFeedback | null;
	onCancel?: () => void;
};
