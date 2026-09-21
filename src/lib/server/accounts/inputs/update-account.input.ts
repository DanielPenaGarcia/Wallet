export type UpdateAccountInput = {
	id: string;
	name: string;
	bankId: string | null;
	cardLastFourDigits: string | null;
	cardColor: string | null;
	balanceCents: number | null;
	balanceAsOfDate: string | null;
	creditLimitCents: number | null;
	statementDay: number | null;
	paymentDueDay: number | null;
	isActive: boolean | null;
};
