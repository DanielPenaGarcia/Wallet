import type {
	MovementClassificationKind,
	MovementPaymentMode,
	MovementType
} from './movement.types';

export type MovementFormValues = {
	type?: MovementType;
	title?: string;
	reason?: string;
	amount?: string;
	paymentMode?: MovementPaymentMode;
	installmentCount?: string;
	interestFree?: boolean;
	occurredAt?: string;
	sourceCardId?: string;
	destinationCardId?: string;
	classificationKind?: MovementClassificationKind;
	classificationId?: string;
	recurringIncomeId?: string;
};

export type MovementFormFeedback = {
	action:
		| 'create-movement'
		| 'bulk-create-movements'
		| 'update-movement'
		| 'delete-movement'
		| 'bulk-delete-movements';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: MovementFormValues;
};
