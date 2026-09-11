export type CardMovementOutput = {
	id: string;
	type: 'expense' | 'income' | 'transfer';
	title: string;
	amount: number;
	paymentMode: 'cash' | 'installments' | null;
	installmentCount: number | null;
	interestFree: boolean;
	occurredAt: string;
	sourceCardId: string | null;
	destinationCardId: string | null;
};
