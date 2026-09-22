import { describe, expect, it } from 'vitest';
import type { Loan } from '$lib/modules/loans/types/loan.types';
import {
	applyLoanPaymentsToInstallments,
	buildLoanInstallmentSchedule,
	getLoanFinancingCost,
	summarizeLoan
} from '$lib/modules/loans/utils/loan-calculations';

const loan: Loan = {
	id: 'loan',
	name: 'Loan',
	direction: 'borrowed',
	counterpartyName: 'Counterparty',
	principalAmountCents: 100_00,
	totalRepaymentCents: 110_01,
	installmentCount: 3,
	firstPaymentDate: '2026-01-31',
	currencyCode: 'MXN',
	status: 'active',
	createdAt: '2026-01-01T00:00:00.000Z',
	updatedAt: '2026-01-01T00:00:00.000Z',
	cancelledAt: null
};

describe('loan calculations', () => {
	it('derives financing cost from contractual total and principal', () => {
		expect(getLoanFinancingCost(loan)).toBe(10_01);
	});

	it('distributes installment cents exactly across the full contractual total', () => {
		const schedule = buildLoanInstallmentSchedule(loan);

		expect(schedule.map((installment) => installment.amountCents)).toEqual([36_67, 36_67, 36_67]);
		expect(schedule.reduce((total, installment) => total + installment.amountCents, 0)).toBe(110_01);
	});

	it('clamps monthly due dates when following months have fewer days', () => {
		const schedule = buildLoanInstallmentSchedule(loan);

		expect(schedule.map((installment) => installment.dueDate)).toEqual([
			'2026-01-31',
			'2026-02-28',
			'2026-03-31'
		]);
	});

	it('applies partial payments across installments in order', () => {
		const installments = applyLoanPaymentsToInstallments(buildLoanInstallmentSchedule(loan), 50_00);

		expect(installments[0]).toMatchObject({ coveredAmountCents: 36_67, remainingAmountCents: 0, status: 'paid' });
		expect(installments[1]).toMatchObject({ coveredAmountCents: 13_33, remainingAmountCents: 23_34, status: 'partial' });
		expect(installments[2]).toMatchObject({ coveredAmountCents: 0, remainingAmountCents: 36_67, status: 'pending' });
	});

	it('never reports a negative outstanding amount after overpayment input', () => {
		const summary = summarizeLoan(loan, 999_00);

		expect(summary.outstandingAmountCents).toBe(0);
		expect(summary.progressPercentage).toBe(100);
		expect(summary.nextInstallment).toBeNull();
	});
});
