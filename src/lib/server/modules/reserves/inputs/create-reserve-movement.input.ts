import type { ReserveMovementKind } from '$lib/modules/reserves/types/reserve-movement.types';

export type CreateReserveMovementInput = {
	reserveKind: ReserveMovementKind;
	targetId: string;
	sourceCardId: string;
};
