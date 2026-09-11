import type { Movement } from '$lib/modules/movements/types/movement.types';

type MovementRecord = {
	id: string;
	type: 'expense' | 'income' | 'transfer';
	title: string;
	reason: string | null;
	amount: number;
	currencyCode: string;
	paymentMode: 'cash' | 'installments' | null;
	installmentCount: number | null;
	interestFree: boolean;
	occurredAt: string;
	sourceCardId: string | null;
	sourceCardAlias: string | null;
	sourceCardLastFourDigits: string | null;
	sourceCardKind: 'debit' | 'credit' | null;
	destinationCardId: string | null;
	destinationCardAlias: string | null;
	destinationCardLastFourDigits: string | null;
	destinationCardKind: 'debit' | 'credit' | null;
	expenseId: string | null;
	expenseName: string | null;
	categoryId: string | null;
	categoryName: string | null;
	active: boolean;
	registeredAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
};

export function toMovement(record: MovementRecord): Movement {
	const linkedToExpense = record.type === 'expense' && record.expenseId !== null;
	const hasClassification = record.type === 'expense';
	return {
		id: record.id,
		type: record.type,
		title: record.title,
		reason: record.reason,
		amount: record.amount,
		currencyCode: record.currencyCode,
		paymentMode: record.paymentMode,
		installmentCount: record.installmentCount,
		interestFree: record.interestFree,
		occurredAt: record.occurredAt,
		sourceCardId: record.sourceCardId,
		sourceCardAlias: record.sourceCardAlias,
		sourceCardLastFourDigits: record.sourceCardLastFourDigits,
		sourceCardKind: record.sourceCardKind,
		destinationCardId: record.destinationCardId,
		destinationCardAlias: record.destinationCardAlias,
		destinationCardLastFourDigits: record.destinationCardLastFourDigits,
		destinationCardKind: record.destinationCardKind,
		classificationKind: hasClassification ? (linkedToExpense ? 'expense' : 'category') : null,
		classificationId: hasClassification
			? linkedToExpense
				? record.expenseId
				: record.categoryId
			: null,
		classificationName: hasClassification
			? linkedToExpense
				? (record.expenseName ?? 'Gasto no disponible')
				: (record.categoryName ?? 'Categoría no disponible')
			: null,
		active: record.active,
		registeredAt: record.registeredAt,
		updatedAt: record.updatedAt,
		deletedAt: record.deletedAt
	};
}
