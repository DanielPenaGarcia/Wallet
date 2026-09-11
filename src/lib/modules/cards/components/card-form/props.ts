import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { CardFormFeedback } from '../../types/card-form-feedback.types';
import type { CardListItem } from '../../types/card-list-item.types';

export type CardFormProps = {
	mode: 'create' | 'edit';
	banks: BankOption[];
	card?: CardListItem;
	feedback?: CardFormFeedback | null;
	onCancel?: () => void;
};
