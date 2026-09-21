import type { AccountType } from '$lib/modules/accounts/types/account.types';

export type CreateAccountInput = {
	type: Extract<AccountType, 'debit' | 'credit'>;
	name: string;
	bankId: string;
	cardLastFourDigits: string | null;
	cardColor: string;
	initialBalanceCents: number;
	balanceAsOfDate: string;
	creditLimitCents: number | null;
	statementDay: number | null;
	paymentDueDay: number | null;
	isActive: boolean;
};
