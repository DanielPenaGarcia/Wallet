import type { Bank } from '$lib/modules/banks/types/bank.types';

export const accountTypes = ['personal', 'debit', 'credit'] as const;
export type AccountType = (typeof accountTypes)[number];

export type AccountAdjustment = {
	id: string;
	accountId: string;
	previousBalanceCents: number;
	newBalanceCents: number;
	differenceCents: number;
	reason: string;
	createdAt: string;
};

export type Account = {
	id: string;
	name: string;
	type: AccountType;
	bankId: string | null;
	bank: Bank | null;
	cardLastFourDigits: string | null;
	cardColor: string | null;
	balanceCents: number;
	creditLimitCents: number | null;
	statementDay: number | null;
	paymentDueDay: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	adjustments: AccountAdjustment[];
};
