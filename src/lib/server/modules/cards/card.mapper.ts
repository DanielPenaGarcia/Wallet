import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { InterestFreeInstallmentPurchase } from '$lib/modules/cards/types/interest-free-installment.types';
import { normalizeCardColor } from '$lib/modules/cards/utils/card-color';
import { splitAmountIntoInstallments } from '$lib/modules/cards/utils/installment-amounts';
import { lastDayOfMonth, toIsoDate } from '$lib/shared/utils/local-date';
import type { CardMovementOutput } from './outputs/card-movement.output';

type CardWithBankRecord = {
	id: string;
	kind: 'debit' | 'credit';
	alias: string;
	bankId: string;
	bankName: string;
	color: string;
	lastFourDigits: string;
	currencyCode: string;
	accountId: string | null;
	debitInitialBalance: number | null;
	debitBalance: number | null;
	creditInitialBalance: number | null;
	maximumOfferedCredit: number | null;
	statementDay: number | null;
	paymentDueDay: number | null;
};

type PaidCreditInstallmentRecord = {
	movementId: string;
	installmentNumber: number;
	paidAt: string;
};

function cycleDate(year: number, month: number, dayOfMonth: number) {
	return new Date(year, month, Math.min(dayOfMonth, lastDayOfMonth(year, month)));
}

function currentStatementCycle(statementDay: number, today = new Date()) {
	const statementThisMonth = cycleDate(today.getFullYear(), today.getMonth(), statementDay);
	const previousStatement =
		today >= statementThisMonth
			? statementThisMonth
			: cycleDate(today.getFullYear(), today.getMonth() - 1, statementDay);
	const nextStatement =
		today >= statementThisMonth
			? cycleDate(today.getFullYear(), today.getMonth() + 1, statementDay)
			: statementThisMonth;

	return {
		previousStatementOn: toIsoDate(previousStatement),
		nextStatementOn: toIsoDate(nextStatement)
	};
}

function movementIsInterestFreeInstallment(movement: CardMovementOutput) {
	return movement.paymentMode === 'installments' && movement.interestFree;
}

function movementDate(movement: CardMovementOutput) {
	return movement.occurredAt.slice(0, 10);
}

function consumedCreditInCurrentCycle(
	cardId: string,
	statementDay: number | null,
	movements: CardMovementOutput[]
) {
	if (statementDay === null) return 0;

	const { previousStatementOn, nextStatementOn } = currentStatementCycle(statementDay);

	return movements
		.filter(
			(movement) =>
				movement.type === 'expense' &&
				movement.sourceCardId === cardId &&
				!movementIsInterestFreeInstallment(movement)
		)
		.filter((movement) => {
			const occurredOn = movementDate(movement);
			return occurredOn > previousStatementOn && occurredOn < nextStatementOn;
		})
		.reduce((total, movement) => total + movement.amount, 0);
}

function paidInstallmentsForMovement(
	payments: PaidCreditInstallmentRecord[],
	movementId: string
) {
	return new Map(
		payments
			.filter((payment) => payment.movementId === movementId)
			.map((payment) => [payment.installmentNumber, payment.paidAt])
	);
}

function interestFreeInstallmentPurchases(
	cardId: string,
	movements: CardMovementOutput[],
	payments: PaidCreditInstallmentRecord[]
): InterestFreeInstallmentPurchase[] {
	return movements
		.filter(
			(movement) =>
				movement.type === 'expense' &&
				movement.sourceCardId === cardId &&
				movementIsInterestFreeInstallment(movement)
		)
		.map((movement) => {
			const totalInstallments = Math.max(movement.installmentCount ?? 1, 1);
			const paidInstallments = paidInstallmentsForMovement(payments, movement.id);
			const installments = splitAmountIntoInstallments(movement.amount, totalInstallments).map(
				(amount, index) => {
					const installmentNumber = index + 1;
					const paidAt = paidInstallments.get(installmentNumber) ?? null;
					return {
						movementId: movement.id,
						installmentNumber,
						totalInstallments,
						amount,
						paid: paidAt !== null,
						paidAt
					};
				}
			);
			const unpaidAmount = installments
				.filter((installment) => !installment.paid)
				.reduce((total, installment) => total + installment.amount, 0);

			return {
				id: movement.id,
				description: movement.title,
				purchasedOn: movementDate(movement),
				originalAmount: movement.amount,
				totalInstallments,
				unpaidAmount,
				installments
			};
		});
}

export function toCardListItem(
	record: CardWithBankRecord,
	movements: CardMovementOutput[] = [],
	paidInstallments: PaidCreditInstallmentRecord[] = []
): CardListItem {
	const pendingInterestFreePurchases =
		record.kind === 'credit'
			? interestFreeInstallmentPurchases(record.id, movements, paidInstallments)
			: [];
	const pendingInterestFreeAmount = pendingInterestFreePurchases.reduce(
		(total, purchase) => total + purchase.unpaidAmount,
		0
	);
	const cashExpenseAmount =
		record.kind === 'credit'
			? consumedCreditInCurrentCycle(record.id, record.statementDay, movements)
			: null;
	const currentBalance =
		record.kind === 'credit'
			? (cashExpenseAmount ?? 0) + pendingInterestFreeAmount
			: (record.debitBalance ?? 0);

	return {
		id: record.id,
		kind: record.kind,
		alias: record.alias,
		bankId: record.bankId,
		bankName: record.bankName,
		color: normalizeCardColor(record.color),
		lastFourDigits: record.lastFourDigits,
		currencyCode: record.currencyCode,
		initialBalance:
			record.kind === 'credit'
				? (record.creditInitialBalance ?? 0)
				: (record.debitInitialBalance ?? 0),
		currentBalance,
		cashExpenseAmount,
		interestFreeOutstandingAmount: record.kind === 'credit' ? pendingInterestFreeAmount : null,
		accountId: record.kind === 'debit' ? (record.accountId ?? '') : null,
		maximumOfferedCredit: record.kind === 'credit' ? (record.maximumOfferedCredit ?? 0) : null,
		statementDay: record.kind === 'credit' ? record.statementDay : null,
		paymentDueDay: record.kind === 'credit' ? record.paymentDueDay : null,
		interestFreeInstallmentPurchases: pendingInterestFreePurchases
	};
}
