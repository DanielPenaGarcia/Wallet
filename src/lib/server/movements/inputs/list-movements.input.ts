import type { MovementType } from '$lib/modules/movements/types/movement.types';

export type ListMovementsInput = {
	accountId?: string;
	categoryId?: string;
	loanId?: string;
	type?: MovementType;
	startDate?: string;
	endDate?: string;
	includeDeleted?: boolean;
	limit?: number;
};
