import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
import type { Account, AccountType } from '../types/account.types';

const accountTypeLabels: Record<AccountType, string> = {
	personal: 'Personal',
	debit: 'Débito',
	credit: 'Crédito'
};

export function getAccountTypeLabel(type: AccountType) {
	return accountTypeLabels[type];
}

export function getAccountDisplayName(account: Pick<Account, 'type' | 'name'>) {
	return account.type === 'personal' ? 'Efectivo' : account.name;
}

export function formatAccountBalance(balanceCents: number) {
	return formatCurrencyFromMinorUnits(balanceCents, 'MXN');
}

export function getCreditAvailableCents(account: Pick<Account, 'creditLimitCents' | 'balanceCents'>) {
	return Math.max((account.creditLimitCents ?? 0) - account.balanceCents, 0);
}
