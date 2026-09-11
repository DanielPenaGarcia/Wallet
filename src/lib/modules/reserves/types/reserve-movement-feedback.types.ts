import type { ReserveMovementKind } from './reserve-movement.types';

export type ReserveMovementFeedback = {
	action: 'create-reserve-movement';
	targetId?: string;
	reserveKind?: ReserveMovementKind;
	success?: string;
	message?: string;
	errors?: {
		sourceCardId?: string[];
		reserveKind?: string[];
		targetId?: string[];
	};
	values?: {
		sourceCardId?: string;
		reserveKind?: string;
		targetId?: string;
	};
};
