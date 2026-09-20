import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { AccountFormFeedback } from '../../types/account-form-feedback.types';
import type { Account } from '../../types/account.types';

export type AccountFormProps = {
	mode: 'create' | 'edit';
	account?: Account;
	banks: Bank[];
	feedback?: AccountFormFeedback | null;
	onCancel?: () => void;
};
