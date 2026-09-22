import { clampedMonthDate, parseLocalDate } from '$lib/shared/utils/recurrence-date';
import { toIsoDate } from '$lib/shared/utils/local-date';
import type { Loan, LoanInstallment, LoanSummary } from '../types/loan.types';

export function getLoanFinancingCost(input: Pick<Loan, 'principalAmountCents' | 'totalRepaymentCents'>) {
	return input.totalRepaymentCents - input.principalAmountCents;
}

export function buildLoanInstallmentSchedule(input: Pick<Loan, 'totalRepaymentCents' | 'installmentCount' | 'firstPaymentDate'>): Array<Pick<LoanInstallment, 'number' | 'dueDate' | 'amountCents'>> {
	if (input.installmentCount <= 0) return [];
	const firstPaymentDate = parseLocalDate(input.firstPaymentDate);
	if (!firstPaymentDate) return [];

	const baseAmountCents = Math.floor(input.totalRepaymentCents / input.installmentCount);
	const remainderCents = input.totalRepaymentCents % input.installmentCount;

	return Array.from({ length: input.installmentCount }, (_, index) => ({
		number: index + 1,
		dueDate: toIsoDate(clampedMonthDate(
			firstPaymentDate.getFullYear(),
			firstPaymentDate.getMonth() + index,
			firstPaymentDate.getDate()
		)),
		amountCents: baseAmountCents + (index < remainderCents ? 1 : 0)
	}));
}

export function applyLoanPaymentsToInstallments(
	schedule: Array<Pick<LoanInstallment, 'number' | 'dueDate' | 'amountCents'>>,
	paidAmountCents: number
): LoanInstallment[] {
	let remainingPaidAmountCents = Math.max(paidAmountCents, 0);

	return schedule.map((installment) => {
		const coveredAmountCents = Math.min(installment.amountCents, remainingPaidAmountCents);
		remainingPaidAmountCents -= coveredAmountCents;
		const remainingAmountCents = installment.amountCents - coveredAmountCents;
		return {
			...installment,
			coveredAmountCents,
			remainingAmountCents,
			status: remainingAmountCents === 0
				? 'paid'
				: coveredAmountCents > 0
					? 'partial'
					: 'pending'
		};
	});
}

export function summarizeLoan(loan: Loan, paidAmountCents: number): LoanSummary {
	const installments = applyLoanPaymentsToInstallments(
		buildLoanInstallmentSchedule(loan),
		paidAmountCents
	);
	const outstandingAmountCents = Math.max(loan.totalRepaymentCents - paidAmountCents, 0);

	return {
		...loan,
		financingCostCents: getLoanFinancingCost(loan),
		paidAmountCents: Math.min(paidAmountCents, loan.totalRepaymentCents),
		outstandingAmountCents,
		progressPercentage: loan.totalRepaymentCents > 0
			? Math.min(100, Math.round(Math.min(paidAmountCents, loan.totalRepaymentCents) * 100 / loan.totalRepaymentCents))
			: 0,
		nextInstallment: installments.find((installment) => installment.status !== 'paid') ?? null,
		installments
	};
}
