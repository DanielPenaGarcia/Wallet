import type { Account } from '$lib/modules/accounts/types/account.types';
import type { CreateMovementInput } from '$lib/server/movements/inputs/create-movement.input';

export function buildAccountBalanceAdjustmentMovement(input: {
	account: Pick<Account, 'id' | 'name' | 'balanceCents'>;
	newBalanceCents: number;
	reason: string;
	occurredAt: string;
}): CreateMovementInput | null {
	const differenceCents = input.newBalanceCents - input.account.balanceCents;
	if (differenceCents === 0) return null;

	return {
		type: 'adjustment',
		title: `Ajuste de saldo: ${input.account.name}`,
		description: input.reason,
		amountCents: Math.abs(differenceCents),
		currencyCode: 'MXN',
		occurredAt: input.occurredAt,
		sourceAccountId: differenceCents < 0 ? input.account.id : null,
		destinationAccountId: differenceCents > 0 ? input.account.id : null,
		categoryId: null,
		recurringExpenseId: null,
		recurringIncomeId: null,
		loanId: null
	};
}
