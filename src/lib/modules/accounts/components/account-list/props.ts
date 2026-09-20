import type { Account } from '../../types/account.types';

export type AccountListProps = {
	accounts: Account[];
	onCreate: () => void;
	onEdit: (account: Account) => void;
	onAdjustBalance: (account: Account) => void;
	onDelete: (account: Account) => void;
};
