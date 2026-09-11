import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { ReserveMovementFeedback } from '../../types/reserve-movement-feedback.types';
import type { ReserveMovementKind } from '../../types/reserve-movement.types';

export type ReserveActionFormProps = {
	reserveKind: ReserveMovementKind;
	targetId: string;
	targetName: string;
	amount: number;
	amountLabel: string;
	currencyCode: string;
	debitCards: CardListItem[];
	feedback?: ReserveMovementFeedback | null;
};
