export type LoanSettlementInput = {
	id: string;
	accountId: string;
	amountCents: number;
	occurredAt: string;
	description: string | null;
};
