import { describe, expect, it, vi } from 'vitest';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { Loan } from '$lib/modules/loans/types/loan.types';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import type { CreateLoanInput } from '$lib/server/loans/inputs/create-loan.input';
import type { UpdateLoanInput } from '$lib/server/loans/inputs/update-loan.input';
import type { LoanPaymentTotals, LoanRepository } from '$lib/server/loans/loan.repository';
import { LoanService } from '$lib/server/loans/loan.service';
import { MovementValidationError } from '$lib/server/movements/movement.errors';
import type { AccountBalanceChangeInput } from '$lib/server/movements/inputs/account-balance-change.input';
import type { CreateMovementInput } from '$lib/server/movements/inputs/create-movement.input';
import type { ListMovementsInput } from '$lib/server/movements/inputs/list-movements.input';
import type { UpdateMovementInput } from '$lib/server/movements/inputs/update-movement.input';
import type { MovementService, PreparedMovementDeletion, PreparedMovementUpdate } from '$lib/server/movements/movement.service';
import type { MovementOutput } from '$lib/server/movements/outputs/movement.output';

const now = '2026-09-23T12:00:00.000Z';

describe('loan service edition and deletion', () => {
	it('updates loan terms and opening movement through the atomic repository boundary', async () => {
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

		expect(repository.updated).toBeNull();
		expect(repository.atomicUpdates).toHaveLength(1);
		expect(repository.atomicUpdates[0]?.loan).toEqual(expect.objectContaining({
			id: 'loan',
			name: 'Updated loan',
			counterpartyName: 'Updated counterparty',
			principalAmountCents: 120_000,
			totalRepaymentCents: 150_000,
			currencyCode: 'MXN'
		}));
		expect(repository.atomicUpdates[0]?.openingMovement).toEqual(expect.objectContaining({
			id: 'opening',
			type: 'loan_received',
			title: 'Préstamo recibido: Updated loan',
			description: 'Contraparte: Updated counterparty',
			amountCents: 120_000,
			currencyCode: 'MXN',
			destinationAccountId: 'cash',
			loanId: 'loan'
		}));
		expect(movements.updated).toEqual([]);
	});

	it('rejects edits that set the contractual total below principal before settlements', async () => {
		const repository = new FakeLoanRepository([loan()]);
		const service = loanService(repository, new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash' })
		]));

		await expect(service.updateLoan({
			id: 'loan',
			name: 'Updated loan',
			counterpartyName: 'Updated counterparty',
			principalAmountCents: 80_000,
			totalRepaymentCents: 70_000,
			installmentCount: 6,
			firstPaymentDate: '2026-10-01',
			currencyCode: 'MXN'
		})).rejects.toMatchObject({
			errors: { totalRepayment: ['El total contractual no puede ser menor que el principal.'] }
		});
	});

	it('rejects currency changes after creation', async () => {
		const service = loanService(
			new FakeLoanRepository([loan()]),
			new FakeMovementService([movement('opening', 'loan_received')])
		);

		await expect(service.updateLoan(updateInput({ currencyCode: 'USD' }))).rejects.toMatchObject({
			errors: { currencyCode: ['La moneda del préstamo no se puede cambiar después de crearlo.'] }
		});
	});

	it('blocks terms and calendar restructuring when settlements already exist', async () => {
		const repository = new FakeLoanRepository([loan()]);
		repository.paymentTotals.set('loan', 20_000);
		const service = loanService(repository, new FakeMovementService([
			movement('opening', 'loan_received')
		]));

		await expect(service.updateLoan(updateInput({
			principalAmountCents: 90_000,
			totalRepaymentCents: 130_000,
			installmentCount: 6,
			firstPaymentDate: '2026-11-01'
		}))).rejects.toMatchObject({
			errors: {
				principalAmount: ['No puedes cambiar el principal cuando ya existen pagos o cobros.'],
				totalRepayment: ['No puedes cambiar el total contractual cuando ya existen pagos o cobros.'],
				installmentCount: ['No puedes cambiar las cuotas cuando ya existen pagos o cobros.'],
				firstPaymentDate: ['No puedes cambiar el calendario cuando ya existen pagos o cobros.']
			}
		});
	});

	it('allows label-only edits after settlements exist', async () => {
		const repository = new FakeLoanRepository([loan()]);
		repository.paymentTotals.set('loan', 20_000);
		const movements = new FakeMovementService([
			movement('opening', 'loan_received')
		]);
		const service = loanService(repository, movements);

		await service.updateLoan(updateInput({
			name: 'Renamed loan',
			counterpartyName: 'Renamed counterparty'
		}));

		expect(repository.atomicUpdates).toHaveLength(1);
		expect(repository.atomicUpdates[0]?.loan).toEqual(expect.objectContaining({
			name: 'Renamed loan',
			counterpartyName: 'Renamed counterparty'
		}));
	});

	it('translates opening movement balance errors to loan edit errors', async () => {
		const movements = new FakeMovementService([
			movement('opening', 'loan_received')
		]);
		movements.failPrepareUpdate = new MovementValidationError({
			balance: ['El movimiento dejaría la cuenta "Cash" con saldo negativo.']
		});
		const service = loanService(new FakeLoanRepository([loan()]), movements);

		await expect(service.updateLoan(updateInput({ principalAmountCents: 10_000 }))).rejects.toMatchObject({
			errors: {
				principalAmount: ['No puedes ajustar el principal porque el movimiento dejaría la cuenta "cash" con saldo negativo.']
			}
		});
	});

	it('does not persist partial edit state when the atomic repository update fails', async () => {
		const repository = new FakeLoanRepository([loan()]);
		repository.failAtomicUpdate = true;
		const movements = new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash' })
		]);
		const service = loanService(repository, movements);

		await expect(service.updateLoan(updateInput({ principalAmountCents: 110_000, totalRepaymentCents: 130_000 }))).rejects.toThrow('Atomic update failed');

		expect(repository.updated).toBeNull();
		expect(repository.atomicUpdates).toHaveLength(0);
		expect(movements.updated).toHaveLength(0);
	});

	it('reverses active borrowed loan movements before deleting the loan atomically', async () => {
		const repository = new FakeLoanRepository([loan()]);
		const movements = new FakeMovementService([
			movement('opening', 'loan_received', { amountCents: 100_000, destinationAccountId: 'cash', occurredAt: '2026-09-01T00:00:00.000Z' }),
			movement('payment', 'loan_payment', { amountCents: 20_000, sourceAccountId: 'cash', occurredAt: '2026-09-15T00:00:00.000Z' })
		]);
		const service = loanService(repository, movements);

		await service.deleteLoan('loan');

		expect(repository.atomicDeletions).toEqual([
			expect.objectContaining({ loanId: 'loan', movementIds: ['payment', 'opening'] })
		]);
		expect(movements.deletedIds).toEqual([]);
	});

	it('reverses lent loan opening before collections', async () => {
		const repository = new FakeLoanRepository([loan({ direction: 'lent' })]);
		const movements = new FakeMovementService([
			movement('opening', 'loan_disbursement', { amountCents: 100_000, sourceAccountId: 'cash', occurredAt: '2026-09-01T00:00:00.000Z' }),
			movement('collection', 'loan_collection', { amountCents: 20_000, destinationAccountId: 'cash', occurredAt: '2026-09-15T00:00:00.000Z' })
		]);
		const service = loanService(repository, movements);

		await service.deleteLoan('loan');

		expect(repository.atomicDeletions[0]?.movementIds).toEqual(['opening', 'collection']);
	});

	it('does not persist partial deletion state when atomic deletion fails', async () => {
		const repository = new FakeLoanRepository([loan()]);
		repository.failAtomicDelete = true;
		const movements = new FakeMovementService([
			movement('opening', 'loan_received'),
			movement('payment', 'loan_payment', { sourceAccountId: 'cash' })
		]);
		const service = loanService(repository, movements);

		await expect(service.deleteLoan('loan')).rejects.toThrow('Atomic delete failed');

		expect(repository.deletedIds).toEqual([]);
		expect(repository.atomicDeletions).toEqual([]);
		expect(movements.deletedIds).toEqual([]);
	});

	it('rejects editing cancelled loans', async () => {
		const service = loanService(
			new FakeLoanRepository([loan({ status: 'cancelled' })]),
			new FakeMovementService([movement('opening', 'loan_received')])
		);

		await expect(service.updateLoan(updateInput())).rejects.toMatchObject({
			errors: { status: ['Solo puedes editar préstamos activos.'] }
		});
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

function updateInput(overrides: Partial<UpdateLoanInput> = {}): UpdateLoanInput {
	return {
		id: 'loan',
		name: 'Updated loan',
		counterpartyName: 'Updated counterparty',
		principalAmountCents: 100_000,
		totalRepaymentCents: 120_000,
		installmentCount: 4,
		firstPaymentDate: '2026-10-01',
		currencyCode: 'MXN',
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
	atomicUpdates: Array<{
		loan: UpdateLoanInput;
		openingMovement: UpdateMovementInput;
		balanceChanges: AccountBalanceChangeInput[];
	}> = [];
	atomicDeletions: Array<{
		loanId: string;
		movementIds: string[];
		balanceChanges: AccountBalanceChangeInput[];
	}> = [];
	failAtomicUpdate = false;
	failAtomicDelete = false;

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

	async updateWithOpeningMovement(
		input: UpdateLoanInput,
		openingMovement: UpdateMovementInput,
		balanceChanges: AccountBalanceChangeInput[]
	) {
		if (this.failAtomicUpdate) throw new Error('Atomic update failed');
		this.atomicUpdates.push({ loan: input, openingMovement, balanceChanges });
	}

	async cancel(id: string) {
		const found = await this.findById(id);
		if (found) found.status = 'cancelled';
	}

	async delete(id: string) {
		this.deletedIds.push(id);
	}

	async deleteWithMovementReversals(
		id: string,
		movementIds: string[],
		balanceChanges: AccountBalanceChangeInput[]
	) {
		if (this.failAtomicDelete) throw new Error('Atomic delete failed');
		this.atomicDeletions.push({ loanId: id, movementIds, balanceChanges });
	}
}

class FakeMovementService {
	updated: UpdateMovementInput[] = [];
	deletedIds: string[] = [];
	failPrepareUpdate: MovementValidationError | null = null;

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

	async prepareMovementUpdate(input: UpdateMovementInput): Promise<PreparedMovementUpdate> {
		if (this.failPrepareUpdate) throw this.failPrepareUpdate;
		return {
			input,
			balanceChanges: [{ accountId: 'cash', newBalanceCents: 520_000 }]
		};
	}

	async deleteMovement(id: string) {
		this.deletedIds.push(id);
		const found = this.movements.find((movement) => movement.id === id);
		if (found) found.active = false;
	}

	async prepareMovementDeletionBatch(ids: string[]): Promise<PreparedMovementDeletion> {
		return {
			ids,
			balanceChanges: [{ accountId: 'cash', newBalanceCents: 500_000 }]
		};
	}
}
