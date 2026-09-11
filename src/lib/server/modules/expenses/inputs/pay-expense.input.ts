export type PayExpenseInput = {
	expenseId: string;
	mode: 'paid' | 'card';
	amount: number;
	paidAt: string;
	note: string | null;
	cardId: string | null;
};
