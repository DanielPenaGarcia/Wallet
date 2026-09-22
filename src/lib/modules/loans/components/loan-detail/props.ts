import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { LoanFormFeedback } from '../../types/loan-form-feedback.types';
import type { LoanSummary } from '../../types/loan.types';

export type LoanDetailProps = {
	loan: LoanSummary;
	cards: CardListItem[];
	movements: Array<{
		id: string;
		type: string;
		title: string;
		amountCents: number;
		currencyCode: string;
		occurredAt: string;
		accountLabel: string | null;
	}>;
	feedback?: LoanFormFeedback | null;
};
