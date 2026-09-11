import type { ExpenseAmountKind } from '../../types/expense.types';

export type ExpenseAmountKindFieldProps = {
	id: string;
	value: ExpenseAmountKind;
	error?: string;
};
