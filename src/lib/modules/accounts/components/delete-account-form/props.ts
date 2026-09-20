import type { AccountFormFeedback } from '../../types/account-form-feedback.types';
import type { Account } from '../../types/account.types';

export type DeleteAccountFormProps = {
	account: Account;
	feedback?: AccountFormFeedback | null;
	onCancel: () => void;
};
