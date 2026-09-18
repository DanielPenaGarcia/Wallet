import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import { isCardBalanceAdjustmentMovement } from '$lib/modules/cards/constants/card-balance-adjustment';
import { isDefaultPersonalAccount } from '$lib/modules/cards/constants/default-account';
import type { InterestFreeInstallmentPurchase } from '$lib/modules/cards/types/interest-free-installment.types';
import { normalizeCardColor } from '$lib/modules/cards/utils/card-color';
import { openCreditCardStatementCycle } from '$lib/modules/cards/utils/credit-card-cycle';
import { splitAmountIntoInstallments } from '$lib/modules/cards/utils/installment-amounts';
import { toIsoDate } from '$lib/shared/utils/local-date';
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

function movementIsInterestFreeInstallment(movement: CardMovementOutput) {
	return movement.paymentMode === 'installments' && movement.interestFree;
}

function movementDate(movement: CardMovementOutput) {
	return movement.occurredAt.slice(0, 10);
}

function consumedCreditInCurrentCycle(
	cardId: string,
	statementDay: number | null,
	movements: CardMovementOutput[],
	referenceDate = new Date(),
	options: { includeBalanceAdjustments?: boolean } = {}
) {
	if (statementDay === null) return 0;

	const includeBalanceAdjustments = options.includeBalanceAdjustments ?? true;
	const { previousStatementDate, statementDate } = openCreditCardStatementCycle(
		statementDay,
		referenceDate
	);
	const previousStatementOn = toIsoDate(previousStatementDate);
	const statementOn = toIsoDate(statementDate);

	return movements
		.filter(
			(movement) =>
				!isCardBalanceAdjustmentMovement(movement) ||
				includeBalanceAdjustments
		)
		.filter(
			(movement) =>
				(movement.type === 'expense' &&
					movement.sourceCardId === cardId &&
					!movementIsInterestFreeInstallment(movement)) ||
				(movement.type === 'income' && movement.destinationCardId === cardId)
		)
		.filter((movement) => {
			const occurredOn = movementDate(movement);
			return occurredOn > previousStatementOn && occurredOn <= statementOn;
		})
		.reduce((total, movement) => {
			if (movement.type === 'income') return total - movement.amount;
			return total + movement.amount;
		}, 0);
}

function creditBalanceFromMovements(
	cardId: string,
	initialBalance: number,
	movements: CardMovementOutput[],
	pendingInterestFreeAmount: number
) {
	const movementBalance = movements.reduce((balance, movement) => {
		if (movementIsInterestFreeInstallment(movement)) return balance;

		if (movement.type === 'income' && movement.destinationCardId === cardId) {
			return balance - movement.amount;
		}

		if (movement.type === 'expense' && movement.sourceCardId === cardId) {
			return balance + movement.amount;
		}

		if (movement.type === 'transfer') {
			if (movement.sourceCardId === cardId) return balance + movement.amount;
			if (movement.destinationCardId === cardId) return balance - movement.amount;
		}

		return balance;
	}, initialBalance);

	return movementBalance + pendingInterestFreeAmount;
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

function debitBalanceFromMovements(
	cardId: string,
	initialBalance: number,
	movements: CardMovementOutput[]
) {
	return movements.reduce((balance, movement) => {
		if (movement.type === 'income' && movement.destinationCardId === cardId) {
			return balance + movement.amount;
		}

		if (movement.type === 'expense' && movement.sourceCardId === cardId) {
			return balance - movement.amount;
		}

		if (movement.type === 'transfer') {
			if (movement.sourceCardId === cardId) return balance - movement.amount;
			if (movement.destinationCardId === cardId) return balance + movement.amount;
		}

		return balance;
	}, initialBalance);
}

export function toCardListItem(
	record: CardWithBankRecord,
	movements: CardMovementOutput[] = [],
	paidInstallments: PaidCreditInstallmentRecord[] = [],
	referenceDate = new Date()
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
			? consumedCreditInCurrentCycle(
					record.id,
					record.statementDay,
					movements,
					referenceDate,
					{ includeBalanceAdjustments: false }
				)
			: null;
	const debitInitialBalance = record.debitInitialBalance ?? 0;
	const creditInitialBalance = record.creditInitialBalance ?? 0;
	const currentBalance =
		record.kind === 'credit'
			? creditBalanceFromMovements(
					record.id,
					creditInitialBalance,
					movements,
					pendingInterestFreeAmount
				)
			: debitBalanceFromMovements(record.id, debitInitialBalance, movements);

	return {
		id: record.id,
		kind: record.kind,
		alias: record.alias,
		bankId: record.bankId,
		bankName: record.bankName,
		isDefault: isDefaultPersonalAccount(record.id),
		color: normalizeCardColor(record.color),
		lastFourDigits: record.lastFourDigits,
		currencyCode: record.currencyCode,
		initialBalance:
			record.kind === 'credit'
				? creditInitialBalance
				: debitInitialBalance,
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
