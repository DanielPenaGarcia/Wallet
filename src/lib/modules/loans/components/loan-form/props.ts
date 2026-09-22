import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { LoanFormFeedback } from '../../types/loan-form-feedback.types';

export type LoanFormProps = {
	cards: CardListItem[];
	feedback?: LoanFormFeedback | null;
	onCancel?: () => void;
};
