import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	DEFAULT_PERSONAL_ACCOUNT_ID,
	DEFAULT_PERSONAL_BANK_ID
} from '$lib/modules/cards/constants/default-account';
import {
	banks,
	cards,
	creditCardInstallmentPayments,
	creditCards,
	debitCards
} from '$lib/server/db/schema';
import type { CreateCardInput } from './inputs/create-card.input';
import type { PayCreditInstallmentInput } from './inputs/pay-credit-installment.input';
import type { UpdateCardInput } from './inputs/update-card.input';

const defaultPersonalRegisteredAt = '1970-01-01T00:00:00.000Z';

export async function ensureDefaultPersonalAccount() {
	db.transaction((transaction) => {
		transaction
			.insert(banks)
			.values({
				id: DEFAULT_PERSONAL_BANK_ID,
				name: 'Personal',
				shortName: 'Efectivo',
				countryCode: 'MX',
				active: false,
				registeredAt: defaultPersonalRegisteredAt,
				timeZone: 'America/Hermosillo',
				weekendDays: '[0,6]',
				holidays: '[]'
			})
			.onConflictDoNothing()
			.run();

		transaction
			.insert(cards)
			.values({
				id: DEFAULT_PERSONAL_ACCOUNT_ID,
				kind: 'debit',
				registeredAt: defaultPersonalRegisteredAt,
				alias: 'Personal',
				bankId: DEFAULT_PERSONAL_BANK_ID,
				color: '#16a34a',
				lastFourDigits: '0000',
				currencyCode: 'MXN',
				active: true
			})
			.onConflictDoNothing()
			.run();

		transaction
			.insert(debitCards)
			.values({
				cardId: DEFAULT_PERSONAL_ACCOUNT_ID,
				accountId: 'Efectivo',
				initialLedgerBalance: 0,
				ledgerBalance: 0,
				availableBalance: 0
			})
			.onConflictDoNothing()
			.run();
	});
}

export async function insertCard(input: CreateCardInput) {
	const id = crypto.randomUUID();
	const registeredAt = new Date().toISOString();

	db.transaction((transaction) => {
		transaction.insert(cards).values({
			id,
			kind: input.kind,
			registeredAt,
			alias: input.alias,
			bankId: input.bankId,
			color: input.color,
			lastFourDigits: input.lastFourDigits,
			currencyCode: input.currencyCode,
			active: true
		}).run();

		if (input.kind === 'debit') {
			transaction.insert(debitCards).values({
				cardId: id,
				accountId: input.accountId,
				initialLedgerBalance: input.initialBalance,
				ledgerBalance: input.initialBalance,
				availableBalance: input.initialBalance
			}).run();
			return;
		}

		transaction.insert(creditCards).values({
			cardId: id,
			maximumOfferedCredit: input.maximumOfferedCredit,
			initialBalance: input.initialBalance,
			currentBalance: input.initialBalance,
			statementDay: input.statementDay,
			paymentDueDay: input.paymentDueDay
		}).run();
	});
}

export async function listCardsWithBank() {
	return db
		.select({
			id: cards.id,
			kind: cards.kind,
			alias: cards.alias,
			bankName: banks.name,
			color: cards.color,
			lastFourDigits: cards.lastFourDigits,
			currencyCode: cards.currencyCode,
			bankId: cards.bankId,
			accountId: debitCards.accountId,
			debitInitialBalance: debitCards.initialLedgerBalance,
			debitBalance: debitCards.availableBalance,
			creditInitialBalance: creditCards.initialBalance,
			maximumOfferedCredit: creditCards.maximumOfferedCredit,
			statementDay: creditCards.statementDay,
			paymentDueDay: creditCards.paymentDueDay
		})
		.from(cards)
		.innerJoin(banks, eq(cards.bankId, banks.id))
		.leftJoin(debitCards, eq(cards.id, debitCards.cardId))
		.leftJoin(creditCards, eq(cards.id, creditCards.cardId))
		.where(eq(cards.active, true))
		.orderBy(asc(cards.alias));
}

export async function findActiveCardById(id: string) {
	return db.query.cards.findFirst({
		where: (card, { and, eq }) => and(eq(card.id, id), eq(card.active, true))
	});
}

export async function listCreditInstallmentPaymentsByMovementIds(movementIds: string[]) {
	if (movementIds.length === 0) return [];

	return db
		.select({
			movementId: creditCardInstallmentPayments.movementId,
			installmentNumber: creditCardInstallmentPayments.installmentNumber,
			paidAt: creditCardInstallmentPayments.paidAt
		})
		.from(creditCardInstallmentPayments)
		.where(inArray(creditCardInstallmentPayments.movementId, movementIds));
}

export async function findActiveInterestFreeInstallmentMovement(input: PayCreditInstallmentInput) {
	return db.query.movements.findFirst({
		where: (movement, { and, eq }) =>
			and(
				eq(movement.id, input.movementId),
				eq(movement.sourceCardId, input.cardId),
				eq(movement.type, 'expense'),
				eq(movement.paymentMode, 'installments'),
				eq(movement.interestFree, true),
				eq(movement.active, true)
			)
	});
}

export async function findCreditInstallmentPayment(input: PayCreditInstallmentInput) {
	return db.query.creditCardInstallmentPayments.findFirst({
		where: (payment, { and, eq }) =>
			and(
				eq(payment.movementId, input.movementId),
				eq(payment.installmentNumber, input.installmentNumber)
			)
	});
}

export async function findLaterCreditInstallmentPayment(input: PayCreditInstallmentInput) {
	return db.query.creditCardInstallmentPayments.findFirst({
		where: (payment, { and, eq, gt }) =>
			and(
				eq(payment.movementId, input.movementId),
				gt(payment.installmentNumber, input.installmentNumber)
			)
	});
}

export async function insertCreditInstallmentPayment(
	input: PayCreditInstallmentInput
): Promise<void> {
	const registeredAt = new Date().toISOString();
	await db.insert(creditCardInstallmentPayments).values({
		id: crypto.randomUUID(),
		movementId: input.movementId,
		installmentNumber: input.installmentNumber,
		paidAt: registeredAt,
		registeredAt
	});
}

export async function deleteCreditInstallmentPayment(
	input: PayCreditInstallmentInput
): Promise<void> {
	await db
		.delete(creditCardInstallmentPayments)
		.where(
			and(
				eq(creditCardInstallmentPayments.movementId, input.movementId),
				eq(creditCardInstallmentPayments.installmentNumber, input.installmentNumber)
			)
		);
}

export async function updateCardRecord(input: UpdateCardInput): Promise<void> {
	db.transaction((transaction) => {
		transaction
			.update(cards)
			.set({
				alias: input.alias,
				bankId: input.bankId,
				color: input.color,
				lastFourDigits: input.lastFourDigits,
				currencyCode: input.currencyCode
			})
			.where(eq(cards.id, input.id))
			.run();

		if (input.kind === 'debit') {
			transaction
				.update(debitCards)
				.set({
					accountId: input.accountId,
					initialLedgerBalance: input.initialBalance,
					ledgerBalance: input.initialBalance,
					availableBalance: input.initialBalance
				})
				.where(eq(debitCards.cardId, input.id))
				.run();
			return;
		}

		transaction
			.update(creditCards)
			.set({
				maximumOfferedCredit: input.maximumOfferedCredit,
				initialBalance: input.initialBalance,
				currentBalance: input.initialBalance,
				statementDay: input.statementDay,
				paymentDueDay: input.paymentDueDay
			})
			.where(eq(creditCards.cardId, input.id))
			.run();
	});
}

export async function softDeleteCardRecord(id: string): Promise<void> {
	await db.update(cards).set({ active: false }).where(eq(cards.id, id));
}
