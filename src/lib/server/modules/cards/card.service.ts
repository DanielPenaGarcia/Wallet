import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import { cardBalanceAdjustmentTitles } from '$lib/modules/cards/constants/card-balance-adjustment';
import { latestCreditCardStatementCycle } from '$lib/modules/cards/utils/credit-card-cycle';
import { statementPayableAmount } from '$lib/modules/cards/utils/statement-payable-amount';
import { toIsoDate } from '$lib/shared/utils/local-date';
import { findActiveBankById } from '$lib/server/modules/banks/bank.repository';
import { listActiveMovementsForCards } from '$lib/server/modules/movements/movement.repository';
import { createMovement } from '$lib/server/modules/movements/movement.service';
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
	ensureDefaultPersonalAccount,
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
import type { AdjustCardBalanceInput } from './inputs/adjust-card-balance.input';
import type { CreateCardInput } from './inputs/create-card.input';
import type { PayCreditInstallmentInput } from './inputs/pay-credit-installment.input';
import type { RegisterCardStatementInput } from './inputs/register-card-statement.input';
import type { UpdateCardInput } from './inputs/update-card.input';
import { isDefaultPersonalAccount } from '$lib/modules/cards/constants/default-account';

export async function getCards(referenceDate = new Date()): Promise<CardListItem[]> {
	await ensureDefaultPersonalAccount();
	const [cards, movements] = await Promise.all([listCardsWithBank(), listActiveMovementsForCards()]);
	const paidInstallments = await listCreditInstallmentPaymentsByMovementIds(
		movements
			.filter((movement) => movement.paymentMode === 'installments' && movement.interestFree)
			.map((movement) => movement.id)
	);
	return cards.map((card) => toCardListItem(card, movements, paidInstallments, referenceDate));
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
	if (isDefaultPersonalAccount(id)) throw new CardNotFoundError();
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

export async function registerCardStatement(input: RegisterCardStatementInput): Promise<void> {
	const cards = await getCards();
	const card = cards.find((item) => item.id === input.cardId);
	if (!card || card.kind !== 'credit' || card.statementDay === null || card.paymentDueDay === null) {
		throw new CardNotFoundError();
	}

	const calculatedAmount = statementPayableAmount(card);
	const adjustmentAmount = input.statementAmount - calculatedAmount;
	if (adjustmentAmount === 0) return;

	const { statementDate } = latestCreditCardStatementCycle(card.statementDay);
	const occurredAt = `${toIsoDate(statementDate)}T00:00:00.000Z`;

	if (adjustmentAmount > 0) {
		await createMovement(
			{
				type: 'expense',
				title: 'Saldo en contra - corte',
				amount: adjustmentAmount,
				occurredAt,
				sourceCardId: card.id,
				paymentMode: 'cash',
				installmentCount: null,
				interestFree: false
			},
			{ registerExpensePayment: false }
		);
		return;
	}

	await createMovement({
		type: 'income',
		title: 'Saldo a favor - corte',
		reason: 'Saldo a favor - corte',
		amount: Math.abs(adjustmentAmount),
		occurredAt,
		destinationCardId: card.id
	});
}

export async function adjustCardBalance(input: AdjustCardBalanceInput): Promise<void> {
	const cards = await getCards();
	const card = cards.find((item) => item.id === input.cardId);
	if (!card) throw new CardNotFoundError();

	const adjustmentAmount = input.balanceAmount - card.currentBalance;
	if (adjustmentAmount === 0) return;

	const occurredAt = new Date().toISOString();
	const createsIncome =
		(card.kind === 'debit' && adjustmentAmount > 0) ||
		(card.kind === 'credit' && adjustmentAmount < 0);

	if (createsIncome) {
		await createMovement({
			type: 'income',
			title: cardBalanceAdjustmentTitles.favorable,
			reason: cardBalanceAdjustmentTitles.favorable,
			amount: Math.abs(adjustmentAmount),
			occurredAt,
			destinationCardId: card.id
		});
		return;
	}

	await createMovement(
		{
			type: 'expense',
			title: cardBalanceAdjustmentTitles.unfavorable,
			amount: Math.abs(adjustmentAmount),
			occurredAt,
			sourceCardId: card.id,
			paymentMode: 'cash',
			installmentCount: null,
			interestFree: false
		},
		{ registerExpensePayment: false }
	);
}
