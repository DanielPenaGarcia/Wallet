import type { CardListItem } from '../../types/card-list-item.types';
import type { CardFormFeedback } from '../../types/card-form-feedback.types';

export type CardDetailsProps = {
	card: CardListItem;
	feedback?: CardFormFeedback | null;
};
