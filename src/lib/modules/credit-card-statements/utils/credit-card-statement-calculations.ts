import type { Account } from '$lib/modules/accounts/types/account.types';
import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
import { summarizeInstallmentPurchases } from '$lib/modules/installment-purchases/utils/installment-purchase-calculations';
import type {
	CreditCardProjection,
	CreditCardStatement,
	CreditCardStatementStatus
} from '../types/credit-card-statement.types';
import { getCreditCardCycle } from './credit-card-cycle';

export function getStatementOutstandingAmount(statement: Pick<CreditCardStatement, 'statementBalanceCents' | 'paidAmountCents'> | null) {
	if (!statement) return 0;
	return Math.max(statement.statementBalanceCents - statement.paidAmountCents, 0);
}

export function getStatementStatus(statement: Pick<CreditCardStatement, 'statementBalanceCents' | 'paidAmountCents'>): CreditCardStatementStatus {
	if (statement.paidAmountCents <= 0 && statement.statementBalanceCents > 0) return 'pending';
	if (statement.paidAmountCents > 0 && statement.paidAmountCents < statement.statementBalanceCents) return 'partial';
	return 'paid';
}

export function getFutureInstallmentBalance(purchases: InstallmentPurchase[]) {
	return summarizeInstallmentPurchases(purchases).futureAmountCents;
}

export function getNextInstallmentsAmount(purchases: InstallmentPurchase[]) {
	return summarizeInstallmentPurchases(purchases).nextInstallmentAmountCents;
}

export function getEstimatedUnbilledNonInstallmentAmount(input: {
	accountBalanceCents: number;
	outstandingPreviousStatementCents: number;
	futureInstallmentBalanceCents: number;
}) {
	return input.accountBalanceCents -
		input.outstandingPreviousStatementCents -
		input.futureInstallmentBalanceCents;
}

export function getEstimatedNewStatementCharges(input: {
	presentationUnbilledNonInstallmentCents: number;
	nextInstallmentsCents: number;
}) {
	return input.presentationUnbilledNonInstallmentCents + input.nextInstallmentsCents;
}

export function getEstimatedNextStatementBase(input: {
	outstandingPreviousStatementCents: number;
	estimatedNewStatementChargesCents: number;
}) {
	return input.outstandingPreviousStatementCents + input.estimatedNewStatementChargesCents;
}

export function getCreditCardProjection(input: {
	account: Pick<Account, 'balanceCents' | 'statementDay'>;
	purchases: InstallmentPurchase[];
	latestStatement: CreditCardStatement | null;
	referenceDate?: Date | string;
}): CreditCardProjection {
	const statementDay = input.account.statementDay ?? 1;
	const cycle = getCreditCardCycle({ statementDay, referenceDate: input.referenceDate });
	const outstandingPreviousStatementCents = getStatementOutstandingAmount(input.latestStatement);
	const futureInstallmentBalanceCents = getFutureInstallmentBalance(input.purchases);
	const nextInstallmentsCents = getNextInstallmentsAmount(input.purchases);
	const estimatedUnbilledNonInstallmentCents = getEstimatedUnbilledNonInstallmentAmount({
		accountBalanceCents: input.account.balanceCents,
		outstandingPreviousStatementCents,
		futureInstallmentBalanceCents
	});
	const presentationUnbilledNonInstallmentCents = Math.max(estimatedUnbilledNonInstallmentCents, 0);
	const estimatedNewStatementChargesCents = getEstimatedNewStatementCharges({
		presentationUnbilledNonInstallmentCents,
		nextInstallmentsCents
	});
	const estimatedNextStatementBaseCents = getEstimatedNextStatementBase({
		outstandingPreviousStatementCents,
		estimatedNewStatementChargesCents
	});

	return {
		cycle,
		latestStatement: input.latestStatement,
		latestStatementStatus: input.latestStatement ? getStatementStatus(input.latestStatement) : null,
		outstandingPreviousStatementCents,
		futureInstallmentBalanceCents,
		nextInstallmentsCents,
		estimatedUnbilledNonInstallmentCents,
		presentationUnbilledNonInstallmentCents,
		estimatedNewStatementChargesCents,
		estimatedNextStatementBaseCents,
		hasBalanceCompositionInconsistency: estimatedUnbilledNonInstallmentCents < 0
	};
}
