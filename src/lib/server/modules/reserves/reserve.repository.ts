import { and, eq } from 'drizzle-orm';
import type { ReserveMovementKind } from '$lib/modules/reserves/types/reserve-movement.types';
import { db } from '$lib/server/db';
import { reserveMovements } from '$lib/server/db/schema';

export type ReserveMovementRecord = {
	reserveKind: ReserveMovementKind;
	targetId: string;
	amount: number;
	currencyCode: string;
	cycleDueOn: string;
};

export type InsertReserveMovementInput = ReserveMovementRecord & {
	movementId: string;
	reservedAt: string;
};

export async function insertReserveMovement(input: InsertReserveMovementInput): Promise<void> {
	const registeredAt = new Date().toISOString();
	await db.insert(reserveMovements).values({
		id: crypto.randomUUID(),
		reserveKind: input.reserveKind,
		targetId: input.targetId,
		movementId: input.movementId,
		amount: input.amount,
		currencyCode: input.currencyCode,
		cycleDueOn: input.cycleDueOn,
		reservedAt: input.reservedAt,
		registeredAt
	});
}

export async function listReserveMovementsByCycle(cycleDueOn: string) {
	return db
		.select({
			reserveKind: reserveMovements.reserveKind,
			targetId: reserveMovements.targetId,
			amount: reserveMovements.amount,
			currencyCode: reserveMovements.currencyCode,
			cycleDueOn: reserveMovements.cycleDueOn
		})
		.from(reserveMovements)
		.where(eq(reserveMovements.cycleDueOn, cycleDueOn));
}

export async function listReserveMovementsForCycles(cycleDueOns: string[]) {
	const records: ReserveMovementRecord[] = [];
	for (const cycleDueOn of Array.from(new Set(cycleDueOns))) {
		records.push(...(await listReserveMovementsByCycle(cycleDueOn)));
	}
	return records;
}

export async function reservedAmountForTarget(input: {
	reserveKind: ReserveMovementKind;
	targetId: string;
	cycleDueOn: string;
	currencyCode: string;
}) {
	const records = await db
		.select({ amount: reserveMovements.amount })
		.from(reserveMovements)
		.where(
			and(
				eq(reserveMovements.reserveKind, input.reserveKind),
				eq(reserveMovements.targetId, input.targetId),
				eq(reserveMovements.cycleDueOn, input.cycleDueOn),
				eq(reserveMovements.currencyCode, input.currencyCode)
			)
		);

	return records.reduce((total, record) => total + record.amount, 0);
}
