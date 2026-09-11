import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import { findActiveBankById } from '$lib/server/modules/banks/bank.repository';
import { listActiveMovementsForCards } from '$lib/server/modules/movements/movement.repository';
import {
	ActiveBankNotFoundError,
	CardNotFoundError,
	CreditInstallmentAlreadyPaidError,
	CreditInstallmentCannotUnpayError,
	CreditInstallmentNotFoundError,
	CreditInstallmentNotPaidError,
	InvalidCardKindChangeError
} from './card.errors';
import { toCardListItem } from './card.mapper';
import {
	deleteCreditInstallmentPayment,
	findActiveCardById,
	findActiveInterestFreeInstallmentMovement,
	findCreditInstallmentPayment,
	findLaterCreditInstallmentPayment,
	insertCard,
	insertCreditInstallmentPayment,
	listCreditInstallmentPaymentsByMovementIds,
	listCardsWithBank,
	softDeleteCardRecord,
	updateCardRecord
} from './card.repository';
import type { CreateCardInput } from './inputs/create-card.input';
import type { PayCreditInstallmentInput } from './inputs/pay-credit-installment.input';
import type { UpdateCardInput } from './inputs/update-card.input';

export async function getCards(): Promise<CardListItem[]> {
	const [cards, movements] = await Promise.all([listCardsWithBank(), listActiveMovementsForCards()]);
	const paidInstallments = await listCreditInstallmentPaymentsByMovementIds(
		movements
			.filter((movement) => movement.paymentMode === 'installments' && movement.interestFree)
			.map((movement) => movement.id)
	);
	return cards.map((card) => toCardListItem(card, movements, paidInstallments));
}

export async function createCard(input: CreateCardInput): Promise<void> {
	if (!(await findActiveBankById(input.bankId))) throw new ActiveBankNotFoundError();
	await insertCard(input);
}

export async function updateCard(input: UpdateCardInput): Promise<void> {
	if (!(await findActiveBankById(input.bankId))) throw new ActiveBankNotFoundError();
	const card = await findActiveCardById(input.id);
	if (!card) throw new CardNotFoundError();
	if (card.kind !== input.kind) throw new InvalidCardKindChangeError();
	await updateCardRecord(input);
}

export async function deleteCard(id: string): Promise<void> {
	if (!(await findActiveCardById(id))) throw new CardNotFoundError();
	await softDeleteCardRecord(id);
}

export async function payCreditInstallment(input: PayCreditInstallmentInput): Promise<void> {
	const movement = await findActiveInterestFreeInstallmentMovement(input);
	const totalInstallments = movement?.installmentCount ?? 0;
	if (!movement || input.installmentNumber < 1 || input.installmentNumber > totalInstallments) {
		throw new CreditInstallmentNotFoundError();
	}
	if (await findCreditInstallmentPayment(input)) throw new CreditInstallmentAlreadyPaidError();
	await insertCreditInstallmentPayment(input);
}

export async function unpayCreditInstallment(input: PayCreditInstallmentInput): Promise<void> {
	const movement = await findActiveInterestFreeInstallmentMovement(input);
	const totalInstallments = movement?.installmentCount ?? 0;
	if (!movement || input.installmentNumber < 1 || input.installmentNumber > totalInstallments) {
		throw new CreditInstallmentNotFoundError();
	}
	if (!(await findCreditInstallmentPayment(input))) throw new CreditInstallmentNotPaidError();
	if (await findLaterCreditInstallmentPayment(input)) {
		throw new CreditInstallmentCannotUnpayError();
	}
	await deleteCreditInstallmentPayment(input);
}
