import type { Bank } from '../../types/bank.types';
import type { BankFormFeedback } from '../../types/bank-form-feedback.types';

export type BankSettingsProps = {
	banks: Bank[];
	feedback?: BankFormFeedback | null;
};
