export const DEFAULT_PERSONAL_ACCOUNT_ID = 'personal-cash-account';
export const DEFAULT_PERSONAL_BANK_ID = 'personal-cash-bank';

export function isDefaultPersonalAccount(id: string) {
	return id === DEFAULT_PERSONAL_ACCOUNT_ID;
}
