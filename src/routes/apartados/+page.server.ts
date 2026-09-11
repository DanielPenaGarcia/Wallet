import { fail } from '@sveltejs/kit';
import { createReserveMovementSchema } from '$lib/modules/reserves/schemas/create-reserve-movement.schema';
import { getCards } from '$lib/server/modules/cards/card.service';
import { getDashboardSummary } from '$lib/server/modules/dashboard/dashboard.service';
import {
	InsufficientReserveSourceBalanceError,
	InvalidReserveAmountError,
	InvalidReserveSourceError,
	ReserveNotFoundError
} from '$lib/server/modules/reserves/reserve.errors';
import { createReserveMovement } from '$lib/server/modules/reserves/reserve.service';

export async function load() {
	const [summary, cards] = await Promise.all([getDashboardSummary(), getCards()]);
	return {
		summary,
		debitCards: cards.filter((card) => card.kind === 'debit')
	};
}

function reserveValues(entries: Record<string, FormDataEntryValue>) {
	return {
		sourceCardId: String(entries.sourceCardId ?? ''),
		reserveKind: String(entries.reserveKind ?? ''),
		targetId: String(entries.targetId ?? '')
	};
}

function reserveTarget(entries: Record<string, FormDataEntryValue>) {
	const values = reserveValues(entries);
	return {
		targetId: values.targetId,
		reserveKind: values.reserveKind
	};
}

function isReserveBusinessError(error: unknown) {
	return (
		error instanceof InvalidReserveAmountError ||
		error instanceof InsufficientReserveSourceBalanceError ||
		error instanceof InvalidReserveSourceError ||
		error instanceof ReserveNotFoundError
	);
}

export const actions = {
	createReserveMovement: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createReserveMovementSchema.safeParse(entries);
		const target = reserveTarget(entries);

		if (!result.success) {
			return fail(400, {
				action: 'create-reserve-movement' as const,
				...target,
				errors: result.error.flatten().fieldErrors,
				values: reserveValues(entries)
			});
		}

		try {
			await createReserveMovement(result.data);
			return {
				action: 'create-reserve-movement' as const,
				targetId: result.data.targetId,
				reserveKind: result.data.reserveKind,
				success: 'Apartado registrado correctamente.'
			};
		} catch (error) {
			if (isReserveBusinessError(error)) {
				return fail(400, {
					action: 'create-reserve-movement' as const,
					targetId: result.data.targetId,
					reserveKind: result.data.reserveKind,
					message: (error as Error).message,
					values: reserveValues(entries)
				});
			}
			throw error;
		}
	}
};
