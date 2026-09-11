import type { Movement } from '$lib/modules/movements/types/movement.types';
import { findActiveCardById } from '$lib/server/modules/cards/card.repository';
import { findActiveCategoryById } from '$lib/server/modules/categories/category.repository';
import {
	deleteExpensePaymentsByMovementId,
	findActiveExpenseById,
	insertExpensePayment
} from '$lib/server/modules/expenses/expense.repository';
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

type CreateMovementOptions = {
	registerExpensePayment?: boolean;
};

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
				'Las compras a meses solo pueden registrarse con una cuenta de crédito.'
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
			'Por ahora las transferencias requieren cuentas con la misma moneda.'
		);
	}
	return sourceCard.currencyCode;
}

export async function getMovements(filter: MovementFilter = {}): Promise<Movement[]> {
	return (await listActiveMovements(filter)).map(toMovement);
}

async function registerExpensePaymentFromMovement(
	movementId: string,
	input: CreateMovementInput
): Promise<void> {
	if (input.type !== 'expense' || input.classificationKind !== 'expense' || !input.classificationId) {
		return;
	}

	const expense = await findActiveExpenseById(input.classificationId);
	if (!expense) return;

	await insertExpensePayment({
		expenseId: input.classificationId,
		mode: 'card',
		amount: input.amount,
		currencyCode: expense.currencyCode,
		note: input.title,
		cardId: input.sourceCardId ?? null,
		movementId,
		paidAt: input.occurredAt
	});
}

export async function createMovement(
	input: CreateMovementInput,
	options: CreateMovementOptions = {}
): Promise<string> {
	const currencyCode = await getValidatedCardCurrency(input);
	const movementId = await insertMovement(input, currencyCode);
	if (options.registerExpensePayment !== false) {
		await registerExpensePaymentFromMovement(movementId, input);
	}
	return movementId;
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
	const currencyCode = await getValidatedCardCurrency(input);
	await updateMovementRecord(input, currencyCode);
	await deleteExpensePaymentsByMovementId(input.id);
	await registerExpensePaymentFromMovement(input.id, input);
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
