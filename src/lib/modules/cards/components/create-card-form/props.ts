import type { BankOption } from '$lib/modules/banks/types/bank-option.types';
import type { CardFormFeedback } from '../../types/card-form-feedback.types';

export type CreateCardFormProps = {
	banks: BankOption[];
	feedback?: CardFormFeedback | null;
};
