import type {
	MovementClassificationKind,
	MovementPaymentMode,
	MovementType
} from '$lib/modules/movements/types/movement.types';

export type CreateMovementInput = {
	type: MovementType;
	title: string;
	reason?: string;
	amount: number;
	paymentMode?: MovementPaymentMode;
	installmentCount?: number | null;
	interestFree?: boolean;
	occurredAt: string;
	sourceCardId?: string;
	destinationCardId?: string;
	classificationKind?: MovementClassificationKind;
	classificationId?: string;
};
