import type { Bank } from '../../types/bank.types';
import type { BankFormFeedback } from '../../types/bank-form-feedback.types';

export type BankFormProps = {
	mode: 'create' | 'edit';
	bank?: Bank;
	feedback?: BankFormFeedback | null;
	onCancel?: () => void;
};
