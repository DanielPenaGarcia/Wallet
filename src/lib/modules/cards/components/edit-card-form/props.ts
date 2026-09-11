import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { CardFormFeedback } from '../../types/card-form-feedback.types';
import type { CardListItem } from '../../types/card-list-item.types';

export type EditCardFormProps = {
	card: CardListItem;
	banks: BankOption[];
	feedback?: CardFormFeedback | null;
	onCancel?: () => void;
};
