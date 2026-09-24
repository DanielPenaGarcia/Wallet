import { describe, expect, it, vi } from 'vitest';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { Loan } from '$lib/modules/loans/types/loan.types';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import type { CreateLoanInput } from '$lib/server/loans/inputs/create-loan.input';
import type { UpdateLoanInput } from '$lib/server/loans/inputs/update-loan.input';
import type { LoanPaymentTotals, LoanRepository } from '$lib/server/loans/loan.repository';
import { LoanService } from '$lib/server/loans/loan.service';
import type { CreateMovementInput } from '$lib/server/movements/inputs/create-movement.input';
import type { ListMovementsInput } from '$lib/server/movements/inputs/list-movements.input';
import type { UpdateMovementInput } from '$lib/server/movements/inputs/update-movement.input';
import type { MovementService } from '$lib/server/movements/movement.service';
import type { MovementOutput } from '$lib/server/movements/outputs/movement.output';

const now = '2026-09-23T12:00:00.000Z';

describe('loan service edition and deletion', () => {
	it('updates loan terms and keeps the opening movement in sync', async () => {
		const repository = new FakeLoanRepository([loan()]);
		const movements = new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash' })
		]);
		const service = loanService(repository, movements);

		await service.updateLoan({
			id: 'loan',
			name: 'Updated loan',
			counterpartyName: 'Updated counterparty',
			principalAmountCents: 120_000,
			totalRepaymentCents: 150_000,
			installmentCount: 6,
			firstPaymentDate: '2026-10-01',
			currencyCode: 'mxn'
		});

		expect(repository.updated).toEqual(expect.objectContaining({
			id: 'loan',
			name: 'Updated loan',
			counterpartyName: 'Updated counterparty',
			principalAmountCents: 120_000,
			totalRepaymentCents: 150_000,
			currencyCode: 'MXN'
		}));
		expect(movements.updated).toEqual([
			expect.objectContaining({
				id: 'opening',
				type: 'loan_received',
				title: 'Préstamo recibido: Updated loan',
				description: 'Contraparte: Updated counterparty',
				amountCents: 120_000,
				currencyCode: 'MXN',
				destinationAccountId: 'cash',
				loanId: 'loan'
			})
		]);
	});

	it('rejects edits that set the contractual total below paid settlements', async () => {
		const repository = new FakeLoanRepository([loan()]);
		repository.paymentTotals.set('loan', 80_000);
		const service = loanService(repository, new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash' })
		]));

		await expect(service.updateLoan({
			id: 'loan',
			name: 'Updated loan',
			counterpartyName: 'Updated counterparty',
			principalAmountCents: 60_000,
			totalRepaymentCents: 70_000,
			installmentCount: 6,
			firstPaymentDate: '2026-10-01',
			currencyCode: 'MXN'
		})).rejects.toMatchObject({
			errors: { totalRepayment: ['El total contractual no puede ser menor que lo ya pagado o cobrado.'] }
		});
	});

	it('reverses active borrowed loan movements before deleting the loan', async () => {
		const repository = new FakeLoanRepository([loan()]);
		const movements = new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash', occurredAt: '2026-09-01T00:00:00.000Z' }),
			movement('payment', 'loan_payment', { amountCents: 20_000, sourceAccountId: 'cash', occurredAt: '2026-09-15T00:00:00.000Z' })
		]);
		const service = loanService(repository, movements);

		await service.deleteLoan('loan');

		expect(movements.deletedIds).toEqual(['payment', 'opening']);
		expect(repository.deletedIds).toEqual(['loan']);
	});
});

function loan(overrides: Partial<Loan> = {}): Loan {
	return {
		id: 'loan',
		name: 'Loan',
		direction: 'borrowed',
		counterpartyName: 'Counterparty',
		principalAmountCents: 100_000,
		totalRepaymentCents: 120_000,
		installmentCount: 4,
		firstPaymentDate: '2026-10-01',
		currencyCode: 'MXN',
		status: 'active',
		createdAt: now,
		updatedAt: now,
		cancelledAt: null,
		...overrides
	};
}

function movement(
	id: string,
	type: MovementOutput['type'],
	overrides: Partial<MovementOutput> = {}
): MovementOutput {
	return {
		id,
		type,
		title: id,
		description: null,
		amountCents: 100_000,
		currencyCode: 'MXN',
		occurredAt: now,
		sourceAccountId: null,
		destinationAccountId: null,
		categoryId: null,
		recurringExpenseId: null,
		recurringIncomeId: null,
		loanId: 'loan',
		active: true,
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
		...overrides
	};
}

function account(): Account {
	return {
		id: 'cash',
		name: 'Cash',
		type: 'personal',
		bankId: null,
		bank: null,
		cardLastFourDigits: null,
		cardColor: null,
		balanceCents: 500_000,
		balanceAsOfDate: '2026-09-23',
		creditLimitCents: null,
		statementDay: null,
		paymentDueDay: null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		adjustments: []
	};
}

function loanService(repository: FakeLoanRepository, movements: FakeMovementService) {
	return new LoanService(
		repository,
		{
			findById: vi.fn(async () => account())
		} as unknown as AccountRepository,
		movements as unknown as MovementService
	);
}

class FakeLoanRepository implements LoanRepository {
	paymentTotals = new Map<string, number>();
	updated: UpdateLoanInput | null = null;
	deletedIds: string[] = [];

	constructor(private readonly loans: Loan[]) {}

	async list() {
		return this.loans;
	}

	async findById(id: string) {
		return this.loans.find((loan) => loan.id === id);
	}

	async listPaymentTotals(): Promise<LoanPaymentTotals[]> {
		return Array.from(this.paymentTotals, ([loanId, paidAmountCents]) => ({ loanId, paidAmountCents }));
	}

	async getPaymentTotal(loanId: string) {
		return this.paymentTotals.get(loanId) ?? 0;
	}

	async create(input: CreateLoanInput & { id: string }) {
		const created = loan(input);
		this.loans.push(created);
		return created;
	}

	async update(input: UpdateLoanInput) {
		this.updated = input;
	}

	async cancel(id: string) {
		const found = await this.findById(id);
		if (found) found.status = 'cancelled';
	}

	async delete(id: string) {
		this.deletedIds.push(id);
	}
}

class FakeMovementService {
	updated: UpdateMovementInput[] = [];
	deletedIds: string[] = [];

	constructor(private readonly movements: MovementOutput[]) {}

	async listMovements(input: ListMovementsInput = {}) {
		return this.movements.filter((movement) =>
			movement.active &&
			(!input.loanId || movement.loanId === input.loanId) &&
			(!input.type || movement.type === input.type)
		);
	}

	async createMovement(input: CreateMovementInput) {
		const created = movement('created', input.type, input);
		this.movements.push(created);
		return created;
	}

	async updateMovement(input: UpdateMovementInput) {
		this.updated.push(input);
		return movement(input.id, input.type, input);
	}

	async deleteMovement(id: string) {
		this.deletedIds.push(id);
		const found = this.movements.find((movement) => movement.id === id);
		if (found) found.active = false;
	}
}
