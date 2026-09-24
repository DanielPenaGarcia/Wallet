import type { Loan } from '$lib/modules/loans/types/loan.types';
import type { AccountBalanceChangeInput } from '$lib/server/movements/inputs/account-balance-change.input';
import type { UpdateMovementInput } from '$lib/server/movements/inputs/update-movement.input';
import type { CreateLoanInput } from './inputs/create-loan.input';
import type { UpdateLoanInput } from './inputs/update-loan.input';

export type LoanPaymentTotals = {
	loanId: string;
	paidAmountCents: number;
};

export interface LoanRepository {
	list(): Promise<Loan[]>;
	findById(id: string): Promise<Loan | undefined>;
	listPaymentTotals(): Promise<LoanPaymentTotals[]>;
	getPaymentTotal(loanId: string): Promise<number>;
	create(input: CreateLoanInput & { id: string }): Promise<Loan>;
	update(input: UpdateLoanInput): Promise<void>;
	updateWithOpeningMovement(
		input: UpdateLoanInput,
		openingMovement: UpdateMovementInput,
		balanceChanges: AccountBalanceChangeInput[]
	): Promise<void>;
	cancel(id: string): Promise<void>;
	deleteWithMovementReversals(
		id: string,
		movementIds: string[],
		balanceChanges: AccountBalanceChangeInput[]
	): Promise<void>;
	delete(id: string): Promise<void>;
}
