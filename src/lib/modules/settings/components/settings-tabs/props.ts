import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { BankFormFeedback } from '$lib/modules/banks/types/bank-form-feedback.types';

export type SettingsTabsProps = {
	banks: Bank[];
	feedback?: BankFormFeedback | null;
};
