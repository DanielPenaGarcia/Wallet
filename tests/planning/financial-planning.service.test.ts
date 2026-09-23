import { describe, expect, it } from 'vitest';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import type { LoanSummary } from '$lib/modules/loans/types/loan.types';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import { FinancialPlanningService } from '$lib/server/planning/financial-planning.service';

const now = '2026-09-23T12:00:00.000Z';
const referenceDate = new Date('2026-09-23T08:00:00.000Z');

describe('financial planning next income', () => {
	const service = new FinancialPlanningService();

	it('determines the period between the next income and the following income', () => {
		const planning = service.planNextIncome({
			accounts: [account('cash', 'personal', 0)],
			recurringIncomes: [income('payroll', { type: 'weekly', weekday: 'friday' })],
			recurringExpenses: [],
			creditCardStatements: [],
			goals: [],
			referenceDate
		});

		expect(planning.nextIncome).toMatchObject({ date: '2026-09-25', amountCents: 1_000_00 });
		expect(planning.period).toEqual({
			startDate: '2026-09-25',
			endDate: '2026-10-02',
			hasFollowingIncome: true
		});
	});

	it('groups multiple incomes on the same next date into one planning inflow', () => {
		const planning = service.planNextIncome({
			accounts: [account('cash', 'personal', 0)],
			recurringIncomes: [
				income('payroll', { type: 'weekly', weekday: 'friday' }, { title: 'Payroll', expectedAmountCents: 1_000_00 }),
				income('support', { type: 'weekly', weekday: 'friday' }, { title: 'Support', expectedAmountCents: 250_00 })
			],
			recurringExpenses: [],
			creditCardStatements: [],
			goals: [],
			referenceDate
		});

		expect(planning.nextIncome).toMatchObject({
			date: '2026-09-25',
			amountCents: 1_250_00,
			titles: ['Payroll', 'Support']
		});
	});

	it('classifies debit expenses as cash needs and credit expenses as expected credit consumption', () => {
		const planning = service.planNextIncome(baseInput());

		expect(planning.cashObligations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: 'recurring_expense_debit',
					title: 'Rent',
					accountId: 'debit',
					accountType: 'debit',
					amountCents: 600_00
				})
			])
		);
		expect(planning.creditConsumptions).toEqual([
			expect.objectContaining({
				kind: 'recurring_expense_credit',
				title: 'Streaming',
				accountId: 'credit',
				accountType: 'credit',
				amountCents: 400_00
			})
		]);
		expect(planning.totalCashObligationsCents).toBe(1_400_00);
		expect(planning.totalCreditConsumptionCents).toBe(400_00);
	});

	it('uses statement outstanding payments as cash needs without also counting credit recurring expenses as cash', () => {
		const planning = service.planNextIncome(baseInput());

		expect(planning.statementPayments).toEqual([
			expect.objectContaining({
				kind: 'credit_card_statement',
				date: '2026-09-30',
				amountCents: 500_00,
				accountId: 'credit'
			})
		]);
		expect(planning.totalStatementPaymentsCents).toBe(500_00);
		expect(planning.totalCashObligationsCents).toBe(1_400_00);
		expect(planning.cashObligations.find((obligation) => obligation.title === 'Streaming')).toBeUndefined();
	});

	it('uses existing debit and cash balances before reserving from the next income', () => {
		const planning = service.planNextIncome(baseInput());

		expect(planning.existingRealMoneyCents).toBe(2_000_00);
		expect(planning.totalCashAvailableCents).toBe(3_000_00);
		expect(planning.existingMoneyUsedForObligationsCents).toBe(1_400_00);
		expect(planning.nextIncomeReservedForObligationsCents).toBe(0);
		expect(planning.coveredCashObligationsCents).toBe(1_400_00);
		expect(planning.uncoveredCashObligationsCents).toBe(0);
		expect(planning.freeCashCents).toBe(1_600_00);
		expect(planning.nextIncomeAvailableForGoalsCents).toBe(1_000_00);
	});

	it('splits obligation coverage between existing money and the next income', () => {
		const planning = service.planNextIncome({
			...baseInput(),
			accounts: [
				account('cash', 'personal', 350_00),
				account('debit', 'debit', 0),
				account('credit', 'credit', 900_00)
			],
			recurringIncomes: [income('payroll', { type: 'weekly', weekday: 'friday' }, { expectedAmountCents: 1_000_00 })],
			creditCardStatements: [],
			loans: []
		});

		expect(planning.cashObligations.map(obligationCoverage)).toEqual([
			{ title: 'Rent', existing: 350_00, reserve: 250_00, covered: 600_00, uncovered: 0 }
		]);
		expect(planning.existingMoneyUsedForObligationsCents).toBe(350_00);
		expect(planning.nextIncomeReservedForObligationsCents).toBe(250_00);
		expect(planning.nextIncomeAvailableForGoalsCents).toBe(750_00);
	});

	it('covers obligations only with the next income when there is no existing real money', () => {
		const planning = service.planNextIncome({
			...baseInput(),
			accounts: [
				account('cash', 'personal', 0),
				account('debit', 'debit', 0),
				account('credit', 'credit', 900_00)
			],
			recurringIncomes: [income('payroll', { type: 'weekly', weekday: 'friday' }, { expectedAmountCents: 1_000_00 })],
			creditCardStatements: [],
			loans: []
		});

		expect(planning.cashObligations.map(obligationCoverage)).toEqual([
			{ title: 'Rent', existing: 0, reserve: 600_00, covered: 600_00, uncovered: 0 }
		]);
		expect(planning.nextIncomeReservedForObligationsCents).toBe(600_00);
		expect(planning.remainingNextIncomeCents).toBe(200_00);
	});

	it('reports insufficient funds and partial obligation coverage deterministically', () => {
		const planning = service.planNextIncome({
			...baseInput(),
			accounts: [
				account('cash', 'personal', 100_00),
				account('debit', 'debit', 100_00),
				account('credit', 'credit', 900_00)
			],
			recurringIncomes: [income('payroll', { type: 'weekly', weekday: 'friday' }, { expectedAmountCents: 500_00 })]
		});

		expect(planning.totalCashAvailableCents).toBe(700_00);
		expect(planning.existingMoneyUsedForObligationsCents).toBe(200_00);
		expect(planning.nextIncomeReservedForObligationsCents).toBe(500_00);
		expect(planning.nextIncomeAvailableForGoalsCents).toBe(0);
		expect(planning.remainingNextIncomeCents).toBe(0);
		expect(planning.coveredCashObligationsCents).toBe(700_00);
		expect(planning.uncoveredCashObligationsCents).toBe(700_00);
		expect(planning.cashObligations.map(obligationCoverage)).toEqual([
			{ title: 'Rent', existing: 200_00, reserve: 400_00, covered: 600_00, uncovered: 0 },
			{ title: 'Cuota 1: Loan installment', existing: 0, reserve: 100_00, covered: 100_00, uncovered: 200_00 },
			{ title: 'Pago de tarjeta Credit', existing: 0, reserve: 0, covered: 0, uncovered: 500_00 }
		]);
		expect(planning.alerts).toContain('El dinero real disponible no cubre todas las obligaciones del periodo.');
	});

	it('distributes only the next income remainder toward active goals after recommended reserves', () => {
		const planning = service.planNextIncome(baseInput());

		expect(planning.goalAllocations).toEqual([
			expect.objectContaining({
				goalId: 'goal',
				name: 'Emergency fund',
				distributionPercentage: 50,
				allocatedAmountCents: 500_00
			})
		]);
		expect(planning.recommendedGoalAllocationCents).toBe(500_00);
		expect(planning.remainingNextIncomeCents).toBe(500_00);
		expect(planning.remainingFreeCashCents).toBe(1_100_00);
	});

	it('keeps unassigned recurring expenses visible without counting them as cash reserves', () => {
		const planning = service.planNextIncome({
			...baseInput(),
			recurringExpenses: [
				...baseInput().recurringExpenses,
				expense('unassigned', 'Internet', 100_00, { type: 'monthly', day: 28 }, null)
			]
		});

		expect(planning.unassignedRecurringExpenses).toEqual([
			expect.objectContaining({
				kind: 'recurring_expense_unassigned',
				impact: 'requires_attention',
				title: 'Internet',
				amountCents: 100_00,
				accountId: null
			})
		]);
		expect(planning.cashObligations.find((obligation) => obligation.title === 'Internet')).toBeUndefined();
		expect(planning.totalCashObligationsCents).toBe(1_400_00);
		expect(planning.nextIncomeReservedForObligationsCents).toBe(0);
		expect(planning.alerts).toContain('Hay gastos recurrentes sin cuenta de pago asignada.');
	});

	it('includes obligations on the period start and excludes obligations on the following income date', () => {
		const planning = service.planNextIncome({
			...baseInput(),
			recurringExpenses: [
				expense('start', 'Starts today', 100_00, { type: 'monthly', day: 25 }, paymentAccount('debit', 'debit')),
				expense('end', 'Next income day', 200_00, { type: 'monthly', day: 2 }, paymentAccount('debit', 'debit'))
			],
			creditCardStatements: [
				statement('start-statement', 'credit', '2026-09-25', 300_00, 0),
				statement('end-statement', 'credit', '2026-10-02', 400_00, 0)
			],
			loans: [
				loan({
					installments: [
						loanInstallment(1, '2026-09-25', 500_00),
						loanInstallment(2, '2026-10-02', 600_00)
					]
				})
			],
			goals: []
		});

		expect(planning.cashObligations.map((obligation) => obligation.title)).toEqual([
			'Cuota 1: Loan installment',
			'Pago de tarjeta Credit',
			'Starts today'
		]);
		expect(planning.cashObligations.map((obligation) => obligation.date)).toEqual([
			'2026-09-25',
			'2026-09-25',
			'2026-09-25'
		]);
	});

	it('returns a stable fallback horizon when there is no following income', () => {
		const planning = service.planNextIncome({
			accounts: [account('cash', 'personal', 0)],
			recurringIncomes: [income('payroll', { type: 'yearly', month: 9, day: 25 } as unknown as RecurringIncome['paymentSchedule'])],
			recurringExpenses: [],
			creditCardStatements: [],
			goals: [],
			referenceDate
		});

		expect(planning.period).toEqual({
			startDate: '2026-09-25',
			endDate: null,
			hasFollowingIncome: false
		});
		expect(planning.alerts).toContain('No se encontró un ingreso posterior; el horizonte usa 30 días como referencia.');
	});

	it('returns deterministic results for the same inputs', () => {
		const input = baseInput();

		expect(service.planNextIncome(input)).toEqual(service.planNextIncome(input));
	});
});

function baseInput() {
	return {
		accounts: [
			account('cash', 'personal', 750_00),
			account('debit', 'debit', 1_250_00),
			account('credit', 'credit', 900_00)
		],
		recurringIncomes: [income('payroll', { type: 'weekly', weekday: 'friday' })],
		recurringExpenses: [
			expense('rent', 'Rent', 600_00, { type: 'monthly', day: 26 }, paymentAccount('debit', 'debit')),
			expense('streaming', 'Streaming', 400_00, { type: 'monthly', day: 28 }, paymentAccount('credit', 'credit'))
		],
		creditCardStatements: [statement('statement', 'credit', '2026-09-30', 700_00, 200_00)],
		goals: [goal('goal', 'Emergency fund', 50)],
		loans: [loan()],
		referenceDate
	};
}

function obligationCoverage(obligation: {
	title: string;
	coveredByExistingMoneyCents: number;
	reservedFromNextIncomeCents: number;
	coveredAmountCents: number;
	uncoveredAmountCents: number;
}) {
	return {
		title: obligation.title,
		existing: obligation.coveredByExistingMoneyCents,
		reserve: obligation.reservedFromNextIncomeCents,
		covered: obligation.coveredAmountCents,
		uncovered: obligation.uncoveredAmountCents
	};
}

function account(id: string, type: Account['type'], balanceCents: number): Account {
	return {
		id,
		name: type === 'personal' ? 'Efectivo' : id[0].toUpperCase() + id.slice(1),
		type,
		bankId: type === 'personal' ? null : 'bank',
		bank: type === 'personal' ? null : { id: 'bank', name: 'Bank', alias: 'BNK', color: '#123456' },
		cardLastFourDigits: type === 'debit' ? '1234' : null,
		cardColor: type === 'personal' ? null : '#123456',
		balanceCents,
		balanceAsOfDate: '2026-09-21',
		creditLimitCents: type === 'credit' ? 10_000_00 : null,
		statementDay: type === 'credit' ? 15 : null,
		paymentDueDay: type === 'credit' ? 30 : null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		adjustments: []
	};
}

function income(
	id: string,
	paymentSchedule: RecurringIncome['paymentSchedule'],
	overrides: Partial<RecurringIncome> = {}
): RecurringIncome {
	return {
		id,
		title: 'Payroll',
		expectedAmountCents: 1_000_00,
		source: 'work',
		frequency: ['daily', 'weekly', 'semimonthly', 'monthly'].includes(paymentSchedule.type)
			? paymentSchedule.type as RecurringIncome['frequency']
			: 'monthly',
		paymentSchedule,
		workSchedule: null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		...overrides
	};
}

function paymentAccount(id: string, type: 'debit' | 'credit'): RecurringExpense['paymentAccount'] {
	return {
		id,
		name: type === 'credit' ? 'Credit' : 'Debit',
		type,
		bank: { id: 'bank', name: 'Bank', alias: 'BNK', color: '#123456' },
		cardLastFourDigits: type === 'debit' ? '1234' : null,
		cardColor: '#123456',
		isActive: true
	};
}

function expense(
	id: string,
	name: string,
	amountCents: number,
	paymentSchedule: RecurringExpense['paymentSchedule'],
	paymentAccount: RecurringExpense['paymentAccount']
): RecurringExpense {
	return {
		id,
		name,
		categoryId: 'category',
		category: { id: 'category', name: 'Services', color: '#2f80ed', isEssential: true },
		paymentAccountId: paymentAccount?.id ?? null,
		paymentAccount,
		amountCents,
		amountKind: 'fixed',
		frequency: paymentSchedule.type,
		customIntervalCount: null,
		customIntervalUnit: null,
		paymentSchedule,
		statementDay: null,
		lastPaidAt: null,
		nextOccurrenceAt: null,
		isActive: true,
		createdAt: now,
		updatedAt: now
	};
}

function statement(
	id: string,
	accountId: string,
	paymentDueDate: string,
	statementBalanceCents: number,
	paidAmountCents: number
): CreditCardStatement {
	return {
		id,
		accountId,
		periodStartDate: '2026-08-16',
		periodEndDate: '2026-09-15',
		statementDate: '2026-09-15',
		paymentDueDate,
		statementBalanceCents,
		paidAmountCents,
		createdAt: now,
		updatedAt: now
	};
}

function goal(id: string, name: string, distributionPercentage: number): FinancialGoal {
	return {
		id,
		name,
		targetAmountCents: 10_000_00,
		currentAmountCents: 1_000_00,
		distributionPercentage,
		currencyCode: 'MXN',
		priority: 'high',
		status: 'active',
		type: 'emergency_fund',
		createdAt: now,
		updatedAt: now
	};
}

function loan(overrides: Partial<LoanSummary> = {}): LoanSummary {
	return {
		id: 'loan',
		name: 'Loan installment',
		direction: 'borrowed',
		counterpartyName: 'Counterparty',
		principalAmountCents: 1_000_00,
		totalRepaymentCents: 1_200_00,
		installmentCount: 4,
		firstPaymentDate: '2026-09-26',
		currencyCode: 'MXN',
		status: 'active',
		createdAt: now,
		updatedAt: now,
		cancelledAt: null,
		financingCostCents: 200_00,
		paidAmountCents: 0,
		outstandingAmountCents: 1_200_00,
		progressPercentage: 0,
		nextInstallment: null,
		installments: [loanInstallment(1, '2026-09-29', 300_00)],
		...overrides
	};
}

function loanInstallment(number: number, dueDate: string, amountCents: number): LoanSummary['installments'][number] {
	return {
		number,
		dueDate,
		amountCents,
		coveredAmountCents: 0,
		remainingAmountCents: amountCents,
		status: 'pending'
	};
}
