import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { LoanFormFeedback } from '../../types/loan-form-feedback.types';
import type { LoanSummary } from '../../types/loan.types';

export type LoanSettlementFormProps = {
	loan: LoanSummary;
	cards: CardListItem[];
	feedback?: LoanFormFeedback | null;
};
