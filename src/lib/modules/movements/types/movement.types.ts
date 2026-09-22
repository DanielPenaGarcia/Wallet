import type { CardKind } from '$lib/modules/cards/types/card.types';
import type { IsoDateTime } from '$lib/shared/types/date.types';

export const movementPaymentModes = ['cash', 'installments'] as const;
export const movementClassificationKinds = ['income', 'expense', 'category'] as const;
export const movementTypes = [
	'income',
	'expense',
	'transfer',
	'credit_purchase',
	'credit_card_payment',
	'adjustment',
	'loan_received',
	'loan_disbursement',
	'loan_payment',
	'loan_collection'
] as const;

export type MovementPaymentMode = (typeof movementPaymentModes)[number];
export type MovementClassificationKind = (typeof movementClassificationKinds)[number];
export type MovementType = (typeof movementTypes)[number];

export type Movement = {
	id: string;
	type: MovementType;
	title: string;
	reason: string | null;
	amount: number;
	currencyCode: string;
	paymentMode: MovementPaymentMode | null;
	installmentCount: number | null;
	interestFree: boolean;
	occurredAt: IsoDateTime;
	sourceCardId: string | null;
	sourceCardAlias: string | null;
	sourceCardLastFourDigits: string | null;
	sourceCardKind: CardKind | null;
	destinationCardId: string | null;
	destinationCardAlias: string | null;
	destinationCardLastFourDigits: string | null;
	destinationCardKind: CardKind | null;
	classificationKind: MovementClassificationKind | null;
	classificationId: string | null;
	classificationName: string | null;
	loanId: string | null;
	loanName: string | null;
	active: boolean;
	registeredAt: IsoDateTime;
	updatedAt: IsoDateTime | null;
	deletedAt: IsoDateTime | null;
};
