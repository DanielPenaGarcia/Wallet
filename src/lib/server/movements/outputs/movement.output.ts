import type { MovementType } from '$lib/modules/movements/types/movement.types';

export type MovementOutput = {
	id: string;
	type: MovementType;
	title: string;
	description: string | null;
	amountCents: number;
	currencyCode: string;
	occurredAt: string;
	sourceAccountId: string | null;
	destinationAccountId: string | null;
	categoryId: string | null;
	recurringExpenseId: string | null;
	recurringIncomeId: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};
