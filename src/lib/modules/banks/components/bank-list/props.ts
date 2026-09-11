import type { Bank } from '../../types/bank.types';

export type BankListProps = {
	banks: Bank[];
	onCreate: () => void;
	onEdit: (bank: Bank) => void;
	onDelete: (bank: Bank) => void;
};
