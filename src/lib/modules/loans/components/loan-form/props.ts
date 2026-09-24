import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { LoanFormFeedback } from '../../types/loan-form-feedback.types';
import type { LoanSummary } from '../../types/loan.types';

export type LoanFormProps = {
	cards: CardListItem[];
	feedback?: LoanFormFeedback | null;
	mode?: 'create' | 'edit';
	loan?: LoanSummary;
	onCancel?: () => void;
};
