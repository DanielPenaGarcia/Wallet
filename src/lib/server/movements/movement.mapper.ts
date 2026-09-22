import type { MovementType } from '$lib/modules/movements/types/movement.types';
import { movements } from '$lib/server/db/schema';
import type { MovementOutput } from './outputs/movement.output';

export function toMovementOutput(movement: typeof movements.$inferSelect): MovementOutput {
	return {
		id: movement.id,
		type: movement.type as MovementType,
		title: movement.title,
		description: movement.description,
		amountCents: movement.amountCents,
		currencyCode: movement.currencyCode,
		occurredAt: movement.occurredAt,
		sourceAccountId: movement.sourceAccountId,
		destinationAccountId: movement.destinationAccountId,
		categoryId: movement.categoryId,
		recurringExpenseId: movement.recurringExpenseId,
		recurringIncomeId: movement.recurringIncomeId,
		loanId: movement.loanId,
		active: movement.active,
		createdAt: movement.createdAt,
		updatedAt: movement.updatedAt,
		deletedAt: movement.deletedAt
	};
}
