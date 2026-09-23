import type {
	RecurringExpense,
	RecurringExpensesByPaymentAccountType
} from '../types/recurring-expense.types';

export function groupRecurringExpensesByPaymentAccountType(
	expenses: RecurringExpense[]
): RecurringExpensesByPaymentAccountType {
	const grouped: RecurringExpensesByPaymentAccountType = {
		debit: [],
		credit: [],
		unassigned: []
	};

	for (const expense of expenses) {
		const key = expense.paymentAccount?.type === 'debit' || expense.paymentAccount?.type === 'credit'
			? expense.paymentAccount.type
			: 'unassigned';
		grouped[key].push(expense);
	}

	return grouped;
}
