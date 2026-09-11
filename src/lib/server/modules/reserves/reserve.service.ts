import { getCards } from '$lib/server/modules/cards/card.service';
import { getDashboardSummary } from '$lib/server/modules/dashboard/dashboard.service';
import { createMovement } from '$lib/server/modules/movements/movement.service';
import type { CreateReserveMovementInput } from './inputs/create-reserve-movement.input';
import { insertReserveMovement } from './reserve.repository';
import {
	InsufficientReserveSourceBalanceError,
	InvalidReserveAmountError,
	InvalidReserveSourceError,
	ReserveNotFoundError
} from './reserve.errors';

function ensureSourceCanCover(sourceBalance: number, amount: number) {
	if (sourceBalance - amount < 0) throw new InsufficientReserveSourceBalanceError();
}

export async function createReserveMovement(input: CreateReserveMovementInput): Promise<void> {
	const [summary, cards] = await Promise.all([getDashboardSummary(), getCards()]);
	const sourceCard = cards.find((card) => card.id === input.sourceCardId);
	const reservedAt = new Date().toISOString();

	if (!sourceCard || sourceCard.kind !== 'debit') throw new InvalidReserveSourceError();

	if (input.reserveKind === 'credit') {
		const reserve = summary.creditCardReserves.find((item) => item.cardId === input.targetId);
		if (!reserve) throw new ReserveNotFoundError();
		if (reserve.reserveAmount <= 0) throw new InvalidReserveAmountError();
		if (sourceCard.currencyCode !== reserve.currencyCode) {
			throw new InvalidReserveSourceError('Selecciona una cuenta de débito con la misma moneda.');
		}
		ensureSourceCanCover(sourceCard.currentBalance, reserve.reserveAmount);

		const movementId = await createMovement({
			type: 'transfer',
			title: `Apartado: ${reserve.alias}`,
			amount: reserve.reserveAmount,
			occurredAt: reservedAt,
			sourceCardId: sourceCard.id,
			destinationCardId: reserve.cardId
		});
		await insertReserveMovement({
			reserveKind: input.reserveKind,
			targetId: reserve.cardId,
			movementId,
			amount: reserve.reserveAmount,
			currencyCode: reserve.currencyCode,
			cycleDueOn: reserve.nextDueDateIso,
			reservedAt
		});
		return;
	}

	const reserve = summary.reserves.find((item) => item.expenseId === input.targetId);
	if (!reserve) throw new ReserveNotFoundError();
	const amount =
		input.reserveKind === 'semimonthly' ? reserve.reserveAmount : reserve.monthlyReserveAmount;
	if (amount <= 0) throw new InvalidReserveAmountError();
	if (sourceCard.currencyCode !== reserve.currencyCode) {
		throw new InvalidReserveSourceError('Selecciona una cuenta de débito con la misma moneda.');
	}
	ensureSourceCanCover(sourceCard.currentBalance, amount);

	const movementId = await createMovement(
		{
			type: 'expense',
			title: `Apartado: ${reserve.name}`,
			amount,
			occurredAt: reservedAt,
			sourceCardId: sourceCard.id,
			paymentMode: 'cash',
			installmentCount: null,
			interestFree: false,
			classificationKind: 'expense',
			classificationId: reserve.expenseId
		},
		{ registerExpensePayment: false }
	);
	await insertReserveMovement({
		reserveKind: input.reserveKind,
		targetId: reserve.expenseId,
		movementId,
		amount,
		currencyCode: reserve.currencyCode,
		cycleDueOn: reserve.nextDueDateIso,
		reservedAt
	});
}
