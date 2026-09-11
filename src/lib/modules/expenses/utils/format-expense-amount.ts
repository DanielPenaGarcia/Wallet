import type { ExpenseAmountKind } from '../types/expense.types';
import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';

export function formatExpenseAmount(
	amount: number,
	currencyCode: string,
	amountKind: ExpenseAmountKind
) {
	return `${amountKind === 'estimated' ? 'Aprox. ' : ''}${formatCurrencyFromMinorUnits(
		amount,
		currencyCode
	)}`;
}
