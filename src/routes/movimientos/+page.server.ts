import { fail } from '@sveltejs/kit';
import { bulkDeleteMovementsSchema } from '$lib/modules/movements/schemas/bulk-delete-movements.schema';
import { bulkCreateMovementsSchema } from '$lib/modules/movements/schemas/bulk-create-movements.schema';
import { deleteMovementSchema } from '$lib/modules/movements/schemas/delete-movement.schema';
import { createMovementSchema } from '$lib/modules/movements/schemas/create-movement.schema';
import { updateMovementSchema } from '$lib/modules/movements/schemas/update-movement.schema';
import type {
	MovementClassificationKind,
	MovementPaymentMode,
	MovementType
} from '$lib/modules/movements/types/movement.types';
import { formStringValue } from '$lib/shared/utils/form-data';
import { toIsoDate } from '$lib/shared/utils/local-date';
import { getCards } from '$lib/server/modules/cards/card.service';
import { getCategoryOptions } from '$lib/server/modules/categories/category.service';
import { getExpenses } from '$lib/server/modules/expenses/expense.service';
import {
	ActiveMovementCardNotFoundError,
	InvalidMovementPaymentModeError,
	InvalidMovementTransferError,
	InvalidMovementTypeChangeError,
	MovementClassificationNotFoundError,
	MovementNotFoundError
} from '$lib/server/modules/movements/movement.errors';
import {
	createMovement,
	createMovements,
	deleteMovement,
	deleteMovements,
	getMovements,
	updateMovement
} from '$lib/server/modules/movements/movement.service';

function movementFormValues(entries: Record<string, FormDataEntryValue>) {
	const type: MovementType =
		entries.type === 'income' || entries.type === 'transfer' ? entries.type : 'expense';
	const paymentMode: MovementPaymentMode =
		entries.paymentMode === 'installments' ? 'installments' : 'cash';
	const classificationKind: MovementClassificationKind =
		entries.classificationKind === 'expense' ? 'expense' : 'category';

	return {
		type,
		title: formStringValue(entries.title),
		reason: formStringValue(entries.reason),
		amount: formStringValue(entries.amount),
		paymentMode,
		installmentCount: formStringValue(entries.installmentCount),
		interestFree: entries.interestFree === 'on' || entries.interestFree === 'true',
		occurredAt: formStringValue(entries.occurredAt),
		sourceCardId: formStringValue(entries.sourceCardId),
		destinationCardId: formStringValue(entries.destinationCardId),
		classificationKind,
		classificationId: formStringValue(entries.classificationId)
	};
}

const dateParamPattern = /^\d{4}-\d{2}-\d{2}$/;

function dateParam(url: URL, name: string) {
	const value = url.searchParams.get(name)?.trim() ?? '';
	return dateParamPattern.test(value) ? value : '';
}

function dateAtTime(date: string, time: string) {
	return new Date(`${date}T${time}`).toISOString();
}

function movementPeriodFromUrl(url: URL) {
	const startDate = dateParam(url, 'startDate');
	const explicitEndDate = dateParam(url, 'endDate');
	const endDate = startDate && !explicitEndDate ? toIsoDate(new Date()) : explicitEndDate;

	return {
		values: { startDate, endDate },
		filter: {
			startsAt: startDate ? dateAtTime(startDate, '00:00:00.000') : undefined,
			endsAt: endDate ? dateAtTime(endDate, '23:59:59.999') : undefined
		}
	};
}

export async function load({ url }) {
	const period = movementPeriodFromUrl(url);
	const [movements, cards, expenses, categories] = await Promise.all([
		getMovements(period.filter),
		getCards(),
		getExpenses(),
		getCategoryOptions()
	]);
	return { movements, cards, expenses, categories, period: period.values };
}

function isMovementBusinessError(error: unknown) {
	return (
		error instanceof ActiveMovementCardNotFoundError ||
		error instanceof InvalidMovementPaymentModeError ||
		error instanceof InvalidMovementTransferError ||
		error instanceof InvalidMovementTypeChangeError ||
		error instanceof MovementClassificationNotFoundError ||
		error instanceof MovementNotFoundError
	);
}

export const actions = {
	createMovement: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createMovementSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-movement' as const,
				errors: result.error.flatten().fieldErrors,
				values: movementFormValues(entries)
			});
		}

		try {
			await createMovement(result.data);
			return { action: 'create-movement' as const, success: 'Movimiento registrado correctamente.' };
		} catch (error) {
			if (isMovementBusinessError(error)) {
				return fail(400, {
					action: 'create-movement' as const,
					message: (error as Error).message,
					values: movementFormValues(entries)
				});
			}
			throw error;
		}
	},
	bulkCreateMovements: async ({ request }) => {
		const result = bulkCreateMovementsSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			const firstIssue = result.error.issues[0];
			return fail(400, {
				action: 'bulk-create-movements' as const,
				message:
					firstIssue?.message && firstIssue.message !== 'Invalid input'
						? firstIssue.message
						: 'Revisa los movimientos del lote.'
			});
		}

		try {
			await createMovements(result.data.movements);
			return {
				action: 'bulk-create-movements' as const,
				success: `${result.data.movements.length} movimientos registrados correctamente.`
			};
		} catch (error) {
			if (isMovementBusinessError(error)) {
				return fail(400, {
					action: 'bulk-create-movements' as const,
					message: (error as Error).message
				});
			}
			throw error;
		}
	},
	updateMovement: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateMovementSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-movement' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: movementFormValues(entries)
			});
		}

		try {
			await updateMovement(result.data);
			return { action: 'update-movement' as const, success: 'Movimiento actualizado correctamente.' };
		} catch (error) {
			if (isMovementBusinessError(error)) {
				return fail(400, {
					action: 'update-movement' as const,
					targetId,
					message: (error as Error).message,
					values: movementFormValues(entries)
				});
			}
			throw error;
		}
	},
	deleteMovement: async ({ request }) => {
		const result = deleteMovementSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, { action: 'delete-movement' as const, message: 'Movimiento inválido.' });
		}

		try {
			await deleteMovement(result.data.id);
			return { action: 'delete-movement' as const, success: 'Movimiento eliminado correctamente.' };
		} catch (error) {
			if (error instanceof MovementNotFoundError) {
				return fail(400, {
					action: 'delete-movement' as const,
					targetId: result.data.id,
					message: error.message
				});
			}
			throw error;
		}
	},
	bulkDeleteMovements: async ({ request }) => {
		const formData = await request.formData();
		const result = bulkDeleteMovementsSchema.safeParse({ ids: formData.getAll('ids') });
		if (!result.success) {
			return fail(400, {
				action: 'bulk-delete-movements' as const,
				message: result.error.issues[0]?.message ?? 'Selecciona al menos un movimiento.'
			});
		}

		try {
			await deleteMovements(result.data.ids);
			return {
				action: 'bulk-delete-movements' as const,
				success: `${result.data.ids.length} ${result.data.ids.length === 1 ? 'movimiento eliminado' : 'movimientos eliminados'} correctamente.`
			};
		} catch (error) {
			if (error instanceof MovementNotFoundError) {
				return fail(400, {
					action: 'bulk-delete-movements' as const,
					message: error.message
				});
			}
			throw error;
		}
	}
};
