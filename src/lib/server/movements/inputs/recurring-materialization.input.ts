import type { MovementType } from '$lib/modules/movements/types/movement.types';

export type RecurringMaterializationInput = {
	type: MovementType;
	recurringExpenseId?: string | null;
	recurringIncomeId?: string | null;
	occurredOn: string;
	excludeMovementId?: string | null;
};
