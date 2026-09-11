import { normalizeCategoryColor } from '$lib/modules/categories/utils/category-color';
import type { Expense, ExpenseAmountChange, ExpensePayment } from '$lib/modules/expenses/types/expense.types';

type ExpenseRecord = Omit<Expense, 'categoryColor' | 'amountHistory' | 'paymentHistory'> & { categoryColor: string };

export function toExpense(
	record: ExpenseRecord,
	amountHistory: ExpenseAmountChange[],
	paymentHistory: ExpensePayment[]
): Expense {
	return {
		...record,
		categoryColor: normalizeCategoryColor(record.categoryColor),
		amountHistory,
		paymentHistory
	};
}
