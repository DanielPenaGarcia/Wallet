import type { AccountFormFeedback } from '../../types/account-form-feedback.types';
import type { Account } from '../../types/account.types';

export type AdjustAccountBalanceFormProps = {
	account: Account;
	feedback?: AccountFormFeedback | null;
	onCancel: () => void;
};
