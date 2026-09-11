import type { Movement } from '$lib/modules/movements/types/movement.types';
import { findActiveCardById } from '$lib/server/modules/cards/card.repository';
import { findActiveCategoryById } from '$lib/server/modules/categories/category.repository';
import { findActiveExpenseById } from '$lib/server/modules/expenses/expense.repository';
import {
	ActiveMovementCardNotFoundError,
	InvalidMovementPaymentModeError,
	InvalidMovementTransferError,
	InvalidMovementTypeChangeError,
	MovementClassificationNotFoundError,
	MovementNotFoundError
} from './movement.errors';
import { toMovement } from './movement.mapper';
import {
	findActiveMovementById,
	insertMovement,
	listActiveMovements,
	type MovementFilter,
	softDeleteMovementRecord,
	updateMovementRecord
} from './movement.repository';
import type { CreateMovementInput } from './inputs/create-movement.input';
import type { UpdateMovementInput } from './inputs/update-movement.input';

async function getValidatedCardCurrency(input: CreateMovementInput): Promise<string> {
	if (input.type === 'income') {
		const destinationCard = await findActiveCardById(input.destinationCardId ?? '');
		if (!destinationCard) throw new ActiveMovementCardNotFoundError('destination');
		return destinationCard.currencyCode;
	}

	const sourceCard = await findActiveCardById(input.sourceCardId ?? '');
	if (!sourceCard) throw new ActiveMovementCardNotFoundError('source');

	if (input.type === 'expense') {
		if (input.paymentMode === 'installments' && sourceCard.kind !== 'credit') {
			throw new InvalidMovementPaymentModeError(
				'Las compras a meses solo pueden registrarse con una tarjeta de crédito.'
			);
		}
		if (
			input.classificationKind === 'expense' &&
			!(await findActiveExpenseById(input.classificationId ?? ''))
		) {
			throw new MovementClassificationNotFoundError('expense');
		}
		if (
			input.classificationKind === 'category' &&
			!(await findActiveCategoryById(input.classificationId ?? ''))
		) {
			throw new MovementClassificationNotFoundError('category');
		}
		return sourceCard.currencyCode;
	}

	const destinationCard = await findActiveCardById(input.destinationCardId ?? '');
	if (!destinationCard) throw new ActiveMovementCardNotFoundError('destination');
	if (sourceCard.id === destinationCard.id) {
		throw new InvalidMovementTransferError('La cuenta de destino debe ser distinta a la de origen.');
	}
	if (sourceCard.currencyCode !== destinationCard.currencyCode) {
		throw new InvalidMovementTransferError(
			'Por ahora las transferencias requieren cuentas o tarjetas con la misma moneda.'
		);
	}
	return sourceCard.currencyCode;
}

export async function getMovements(filter: MovementFilter = {}): Promise<Movement[]> {
	return (await listActiveMovements(filter)).map(toMovement);
}

export async function createMovement(input: CreateMovementInput): Promise<string> {
	return insertMovement(input, await getValidatedCardCurrency(input));
}

export async function createMovements(inputs: CreateMovementInput[]): Promise<string[]> {
	const movementIds: string[] = [];
	for (const input of inputs) {
		movementIds.push(await createMovement(input));
	}
	return movementIds;
}

export async function updateMovement(input: UpdateMovementInput): Promise<void> {
	const movement = await findActiveMovementById(input.id);
	if (!movement) throw new MovementNotFoundError();
	if (movement.type !== input.type) throw new InvalidMovementTypeChangeError();
	await updateMovementRecord(input, await getValidatedCardCurrency(input));
}

export async function deleteMovement(id: string): Promise<void> {
	if (!(await findActiveMovementById(id))) throw new MovementNotFoundError();
	await softDeleteMovementRecord(id);
}

export async function deleteMovements(ids: string[]): Promise<void> {
	for (const id of ids) {
		await deleteMovement(id);
	}
}
