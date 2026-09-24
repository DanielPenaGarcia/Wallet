import type { Loan } from '$lib/modules/loans/types/loan.types';
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
	cancel(id: string): Promise<void>;
	delete(id: string): Promise<void>;
}
