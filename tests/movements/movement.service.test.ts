import { beforeEach, describe, expect, it } from 'vitest';
import DatabaseClient from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import type { CategoryRepository } from '$lib/server/categories/category.repository';
import type { RecurringExpenseRepository } from '$lib/server/recurring-expenses/recurring-expense.repository';
import type { RecurringIncomeRepository } from '$lib/server/recurring-incomes/recurring-income.repository';
import type { Loan } from '$lib/modules/loans/types/loan.types';
import type { LoanRepository, LoanPaymentTotals } from '$lib/server/loans/loan.repository';
import { buildAccountBalanceAdjustmentMovement } from '$lib/server/accounts/account-balance-adjustment';
import { DrizzleAccountRepository } from '$lib/server/accounts/drizzle-account.repository';
import * as schema from '$lib/server/db/schema';
import type { AccountBalanceChangeInput } from '$lib/server/movements/inputs/account-balance-change.input';
import type { CreateMovementInput } from '$lib/server/movements/inputs/create-movement.input';
import type { RecurringMaterializationInput } from '$lib/server/movements/inputs/recurring-materialization.input';
import type { UpdateMovementInput } from '$lib/server/movements/inputs/update-movement.input';
import { DrizzleMovementRepository } from '$lib/server/movements/drizzle-movement.repository';
import { MovementValidationError } from '$lib/server/movements/movement.errors';
import type { MovementRepository } from '$lib/server/movements/movement.repository';
import { MovementService } from '$lib/server/movements/movement.service';
import type { MovementOutput } from '$lib/server/movements/outputs/movement.output';

const now = '2026-09-21T12:00:00.000Z';
const occurredAt = '2026-09-22T12:00:00.000Z';

class InMemoryAccountRepository implements AccountRepository {
	constructor(private readonly accounts: Map<string, Account>) {}

	findById(id: string) {
		return Promise.resolve(this.accounts.get(id));
	}

	findPersonal() {
		return Promise.resolve(Array.from(this.accounts.values()).find((account) => account.type === 'personal'));
	}

	list() {
		return Promise.resolve(Array.from(this.accounts.values()));
	}

	async createPersonal(): Promise<Account> {
		throw new Error('Not used in movement tests.');
	}

	async create(): Promise<Account> {
		throw new Error('Not used in movement tests.');
	}

	async update() {
		throw new Error('Not used in movement tests.');
	}

	async updateActive() {
		throw new Error('Not used in movement tests.');
	}

	async delete() {
		throw new Error('Not used in movement tests.');
	}

	applyBalanceChange(change: AccountBalanceChangeInput) {
		const account = this.accounts.get(change.accountId);
		if (!account) return;
		this.accounts.set(account.id, {
			...account,
			balanceCents: change.newBalanceCents,
			updatedAt: now
		});
	}
}

class InMemoryMovementRepository implements MovementRepository {
	private sequence = 0;
	private readonly movements = new Map<string, MovementOutput>();

	constructor(private readonly accountRepository: InMemoryAccountRepository) {}

	findById(id: string) {
		return Promise.resolve(this.movements.get(id));
	}

	findActiveRecurringMaterialization(input: RecurringMaterializationInput) {
		return Promise.resolve(Array.from(this.movements.values()).find((movement) =>
			movement.active &&
			movement.type === input.type &&
			movement.id !== input.excludeMovementId &&
			movement.occurredAt.slice(0, 10) === input.occurredOn &&
			(input.recurringExpenseId
				? movement.recurringExpenseId === input.recurringExpenseId
				: movement.recurringIncomeId === input.recurringIncomeId)
		));
	}

	list() {
		return Promise.resolve(Array.from(this.movements.values()).filter((movement) => movement.active));
	}

	createWithBalanceChanges(input: CreateMovementInput, balanceChanges: AccountBalanceChangeInput[]) {
		for (const change of balanceChanges) this.accountRepository.applyBalanceChange(change);

		const movement = this.toMovementOutput(`movement-${++this.sequence}`, input, {
			active: true,
			createdAt: now,
			updatedAt: now,
			deletedAt: null
		});
		this.movements.set(movement.id, movement);
		return Promise.resolve(movement);
	}

	updateWithBalanceChanges(input: UpdateMovementInput, balanceChanges: AccountBalanceChangeInput[]) {
		for (const change of balanceChanges) this.accountRepository.applyBalanceChange(change);

		const original = this.movements.get(input.id);
		if (!original) throw new Error('Movement not found.');

		const movement = this.toMovementOutput(input.id, input, {
			active: original.active,
			createdAt: original.createdAt,
			updatedAt: now,
			deletedAt: original.deletedAt
		});
		this.movements.set(movement.id, movement);
		return Promise.resolve(movement);
	}

	softDeleteWithBalanceChanges(id: string, balanceChanges: AccountBalanceChangeInput[]) {
		for (const change of balanceChanges) this.accountRepository.applyBalanceChange(change);

		const original = this.movements.get(id);
		if (original) {
			this.movements.set(id, {
				...original,
				active: false,
				updatedAt: now,
				deletedAt: now
			});
		}
		return Promise.resolve();
	}

	private toMovementOutput(
		id: string,
		input: CreateMovementInput,
		state: Pick<MovementOutput, 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'>
	): MovementOutput {
		return {
			id,
			type: input.type,
			title: input.title,
			description: input.description,
			amountCents: input.amountCents,
			currencyCode: input.currencyCode,
			occurredAt: input.occurredAt,
			sourceAccountId: input.sourceAccountId,
			destinationAccountId: input.destinationAccountId,
			categoryId: input.categoryId,
			recurringExpenseId: input.recurringExpenseId,
			recurringIncomeId: input.recurringIncomeId,
			loanId: input.loanId,
			...state
		};
	}
}

class InMemoryLoanRepository implements LoanRepository {
	constructor(private readonly loans: Map<string, Loan> = new Map()) {}

	list() {
		return Promise.resolve(Array.from(this.loans.values()));
	}

	findById(id: string) {
		return Promise.resolve(this.loans.get(id));
	}

	listPaymentTotals(): Promise<LoanPaymentTotals[]> {
		return Promise.resolve([]);
	}

	getPaymentTotal() {
		return Promise.resolve(0);
	}

	async create(): Promise<Loan> {
		throw new Error('Not used in movement tests.');
	}

	async update() {
		throw new Error('Not used in movement tests.');
	}

	async cancel() {
		throw new Error('Not used in movement tests.');
	}
}

class InMemoryCategoryRepository implements CategoryRepository {
	constructor(private readonly categories: Map<string, Category>) {}

	findById(id: string) {
		return Promise.resolve(this.categories.get(id));
	}

	hasChildren() {
		return Promise.resolve(false);
	}

	hasRecurringExpenses() {
		return Promise.resolve(false);
	}

	list() {
		return Promise.resolve(Array.from(this.categories.values()));
	}

	async create(): Promise<Category> {
		throw new Error('Not used in movement tests.');
	}

	async update() {
		throw new Error('Not used in movement tests.');
	}

	async delete() {
		throw new Error('Not used in movement tests.');
	}
}

class InMemoryRecurringExpenseRepository implements RecurringExpenseRepository {
	constructor(private readonly expenses: Map<string, RecurringExpense>) {}

	findById(id: string) {
		return Promise.resolve(this.expenses.get(id));
	}

	list() {
		return Promise.resolve(Array.from(this.expenses.values()));
	}

	async create(): Promise<RecurringExpense> {
		throw new Error('Not used in movement tests.');
	}

	async update() {
		throw new Error('Not used in movement tests.');
	}

	async delete() {
		throw new Error('Not used in movement tests.');
	}
}

class InMemoryRecurringIncomeRepository implements RecurringIncomeRepository {
	constructor(private readonly incomes: Map<string, RecurringIncome> = new Map()) {}

	findById(id: string) {
		return Promise.resolve(this.incomes.get(id));
	}

	list() {
		return Promise.resolve(Array.from(this.incomes.values()));
	}

	async create(): Promise<RecurringIncome> {
		throw new Error('Not used in movement tests.');
	}

	async update() {
		throw new Error('Not used in movement tests.');
	}

	async delete() {
		throw new Error('Not used in movement tests.');
	}
}

describe('MovementService balance invariants', () => {
	let accounts: Map<string, Account>;
	let service: MovementService;
	let movementRepository: InMemoryMovementRepository;

	beforeEach(() => {
		accounts = new Map([
			['cash', account({ id: 'cash', name: 'Cash', type: 'personal', balanceCents: 100_00 })],
			['debit', account({ id: 'debit', name: 'Debit', type: 'debit', balanceCents: 200_00 })],
			[
				'credit',
				account({
					id: 'credit',
					name: 'Credit',
					type: 'credit',
					balanceCents: 50_00,
					creditLimitCents: 300_00,
					balanceAsOfDate: '2026-09-20'
				})
			]
		]);
		const accountRepository = new InMemoryAccountRepository(accounts);
		movementRepository = new InMemoryMovementRepository(accountRepository);
		service = new MovementService(
			movementRepository,
			accountRepository,
			new InMemoryCategoryRepository(new Map([['groceries', category('groceries')]])),
			new InMemoryRecurringExpenseRepository(new Map([['rent', recurringExpense('rent', 'groceries')]])),
			new InMemoryRecurringIncomeRepository(new Map([['payroll', recurringIncome('payroll')]])),
			new InMemoryLoanRepository(new Map([
				['borrowed-loan', loan({ id: 'borrowed-loan', direction: 'borrowed' })],
				['lent-loan', loan({ id: 'lent-loan', direction: 'lent' })]
			]))
		);
	});

	it('updates income and expense balances exactly once', async () => {
		await service.createMovement(movement({ type: 'income', amountCents: 25_00, destinationAccountId: 'cash' }));
		expect(accounts.get('cash')?.balanceCents).toBe(125_00);

		await service.createMovement(movement({ type: 'expense', amountCents: 40_00, sourceAccountId: 'cash', categoryId: 'groceries' }));
		expect(accounts.get('cash')?.balanceCents).toBe(85_00);
	});

	it('increases credit debt for credit purchases and rejects purchases over the credit limit', async () => {
		await service.createMovement(movement({ type: 'credit_purchase', amountCents: 100_00, sourceAccountId: 'credit', categoryId: 'groceries' }));
		expect(accounts.get('credit')?.balanceCents).toBe(150_00);

		await expect(
			service.createMovement(movement({ type: 'credit_purchase', amountCents: 200_00, sourceAccountId: 'credit', categoryId: 'groceries' }))
		).rejects.toBeInstanceOf(MovementValidationError);
		expect(accounts.get('credit')?.balanceCents).toBe(150_00);
	});

	it('rejects credit movements on or before the credit balance reference date', async () => {
		await expect(
			service.createMovement(movement({
				type: 'credit_purchase',
				amountCents: 10_00,
				occurredAt: '2026-09-20T23:59:00.000Z',
				sourceAccountId: 'credit',
				categoryId: 'groceries'
			}))
		).rejects.toBeInstanceOf(MovementValidationError);
		expect(accounts.get('credit')?.balanceCents).toBe(50_00);
	});

	it('allows explicit credit balance adjustments on the balance reference date', async () => {
		await service.createMovement(movement({
			type: 'adjustment',
			amountCents: 25_00,
			occurredAt: '2026-09-20T12:00:00.000Z',
			destinationAccountId: 'credit'
		}));

		expect(accounts.get('credit')?.balanceCents).toBe(75_00);
	});

	it('updates both accounts for transfers without changing total real money', async () => {
		await service.createMovement(movement({ type: 'transfer', amountCents: 75_00, sourceAccountId: 'debit', destinationAccountId: 'cash' }));

		expect(accounts.get('debit')?.balanceCents).toBe(125_00);
		expect(accounts.get('cash')?.balanceCents).toBe(175_00);
		expect((accounts.get('debit')?.balanceCents ?? 0) + (accounts.get('cash')?.balanceCents ?? 0)).toBe(300_00);
	});

	it('sets a debit card balance to the entered adjustment amount and records a movement', async () => {
		const debit = accounts.get('debit');
		if (!debit) throw new Error('Debit account fixture is missing.');
		const adjustment = buildAccountBalanceAdjustmentMovement({
			account: debit,
			newBalanceCents: 260_00,
			reason: 'Conciliacion bancaria',
			occurredAt
		});
		if (!adjustment) throw new Error('Adjustment movement was not created.');

		const created = await service.createMovement(adjustment);
		const movements = await service.listMovements();

		expect(accounts.get('debit')?.balanceCents).toBe(260_00);
		expect(created.type).toBe('adjustment');
		expect(created.amountCents).toBe(60_00);
		expect(created.destinationAccountId).toBe('debit');
		expect(created.sourceAccountId).toBeNull();
		expect(created.description).toBe('Conciliacion bancaria');
		expect(movements).toHaveLength(1);
		expect(movements[0]?.id).toBe(created.id);
	});

	it('persists debit balance adjustments atomically through Drizzle', async () => {
		const sqlite = new DatabaseClient(':memory:');
		sqlite.exec(`
			CREATE TABLE banks (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				alias TEXT NOT NULL,
				color TEXT NOT NULL
			);
			CREATE TABLE accounts (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				type TEXT NOT NULL,
				bank_id TEXT,
				card_last_four_digits TEXT,
				card_color TEXT,
				balance_cents INTEGER NOT NULL DEFAULT 0,
				balance_as_of_date TEXT NOT NULL DEFAULT '2026-09-21',
				credit_limit_cents INTEGER,
				statement_day INTEGER,
				payment_due_day INTEGER,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
			CREATE TABLE account_adjustments (
				id TEXT PRIMARY KEY,
				account_id TEXT NOT NULL,
				previous_balance_cents INTEGER NOT NULL,
				new_balance_cents INTEGER NOT NULL,
				difference_cents INTEGER NOT NULL,
				reason TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
			CREATE TABLE movements (
				id TEXT PRIMARY KEY,
				type TEXT NOT NULL,
				title TEXT NOT NULL,
				description TEXT,
				amount_cents INTEGER NOT NULL,
				currency_code TEXT NOT NULL DEFAULT 'MXN',
				occurred_at TEXT NOT NULL,
				source_account_id TEXT,
				destination_account_id TEXT,
				category_id TEXT,
				recurring_expense_id TEXT,
				recurring_income_id TEXT,
				loan_id TEXT,
				active INTEGER NOT NULL DEFAULT 1,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				deleted_at TEXT
			);
		`);
		const database = drizzle(sqlite, { schema });
		await database.insert(schema.accounts).values({
			id: 'debit-db',
			name: 'Debit DB',
			type: 'debit',
			bankId: null,
			cardLastFourDigits: '1234',
			cardColor: '#123a63',
			balanceCents: 200_00,
			balanceAsOfDate: '2026-09-21',
			creditLimitCents: null,
			statementDay: null,
			paymentDueDay: null,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});
		const accountRepository = new DrizzleAccountRepository(database);
		const service = new MovementService(
			new DrizzleMovementRepository(database),
			accountRepository,
			new InMemoryCategoryRepository(new Map()),
			new InMemoryRecurringExpenseRepository(new Map()),
			new InMemoryRecurringIncomeRepository(new Map()),
			new InMemoryLoanRepository()
		);
		const debit = await accountRepository.findById('debit-db');
		if (!debit) throw new Error('Debit account was not persisted.');
		const adjustment = buildAccountBalanceAdjustmentMovement({
			account: debit,
			newBalanceCents: 260_00,
			reason: 'Conciliacion bancaria',
			occurredAt
		});
		if (!adjustment) throw new Error('Adjustment movement was not created.');

		const created = await service.createMovement(adjustment);
		const [persistedDebit] = await database
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.id, 'debit-db'));
		const persistedMovements = await database.select().from(schema.movements);

		expect(persistedDebit?.balanceCents).toBe(260_00);
		expect(persistedMovements).toHaveLength(1);
		expect(persistedMovements[0]?.id).toBe(created.id);
		expect(persistedMovements[0]?.type).toBe('adjustment');
		expect(persistedMovements[0]?.amountCents).toBe(60_00);
		expect(persistedMovements[0]?.destinationAccountId).toBe('debit-db');
		expect(persistedMovements[0]?.sourceAccountId).toBeNull();
	});

	it('reduces real money and credit debt for credit card payments without creating an expense', async () => {
		await service.createMovement(movement({ type: 'credit_card_payment', amountCents: 30_00, sourceAccountId: 'cash', destinationAccountId: 'credit' }));

		expect(accounts.get('cash')?.balanceCents).toBe(70_00);
		expect(accounts.get('credit')?.balanceCents).toBe(20_00);
		const [payment] = await service.listMovements();
		expect(payment.categoryId).toBeNull();
		expect(payment.recurringExpenseId).toBeNull();
	});

	it('handles borrowed loan money without ordinary income semantics', async () => {
		await service.createMovement(movement({
			type: 'loan_received',
			amountCents: 100_00,
			destinationAccountId: 'cash',
			loanId: 'borrowed-loan'
		}));
		await service.createMovement(movement({
			type: 'loan_payment',
			amountCents: 25_00,
			sourceAccountId: 'cash',
			loanId: 'borrowed-loan'
		}));

		expect(accounts.get('cash')?.balanceCents).toBe(175_00);
		const movements = await service.listMovements();
		expect(movements).toHaveLength(2);
		expect(movements.every((item) => item.categoryId === null && item.recurringIncomeId === null)).toBe(true);
	});

	it('handles lent loan disbursement and collection without ordinary expense or income semantics', async () => {
		await service.createMovement(movement({
			type: 'loan_disbursement',
			amountCents: 80_00,
			sourceAccountId: 'debit',
			loanId: 'lent-loan'
		}));
		await service.createMovement(movement({
			type: 'loan_collection',
			amountCents: 30_00,
			destinationAccountId: 'debit',
			loanId: 'lent-loan'
		}));

		expect(accounts.get('debit')?.balanceCents).toBe(150_00);
		const movements = await service.listMovements();
		expect(movements).toHaveLength(2);
		expect(movements.every((item) => item.categoryId === null && item.recurringExpenseId === null)).toBe(true);
	});

	it('rejects mismatched loan directions for loan movements', async () => {
		await expect(service.createMovement(movement({
			type: 'loan_payment',
			amountCents: 10_00,
			sourceAccountId: 'cash',
			loanId: 'lent-loan'
		}))).rejects.toBeInstanceOf(MovementValidationError);
		expect(accounts.get('cash')?.balanceCents).toBe(100_00);
	});

	it('materializes recurring expenses only through linked expense movements', async () => {
		const expense = await service.createMovement(movement({
			type: 'expense',
			amountCents: 60_00,
			sourceAccountId: 'cash',
			categoryId: null,
			recurringExpenseId: 'rent'
		}));

		expect(expense.recurringExpenseId).toBe('rent');
		expect(accounts.get('cash')?.balanceCents).toBe(40_00);
	});

	it('materializes recurring incomes through linked income movements', async () => {
		const income = await service.createMovement(movement({
			type: 'income',
			amountCents: 90_00,
			destinationAccountId: 'cash',
			recurringIncomeId: 'payroll'
		}));

		expect(income.recurringIncomeId).toBe('payroll');
		expect(accounts.get('cash')?.balanceCents).toBe(190_00);
	});

	it('rejects duplicate recurring materializations for the same effective date', async () => {
		await service.createMovement(movement({
			type: 'expense',
			amountCents: 20_00,
			sourceAccountId: 'cash',
			categoryId: null,
			recurringExpenseId: 'rent'
		}));

		await expect(service.createMovement(movement({
			type: 'expense',
			amountCents: 20_00,
			sourceAccountId: 'cash',
			categoryId: null,
			recurringExpenseId: 'rent'
		}))).rejects.toBeInstanceOf(MovementValidationError);
		expect(accounts.get('cash')?.balanceCents).toBe(80_00);
	});

	it('reverses the original impact before applying an edited movement', async () => {
		const expense = await service.createMovement(movement({ type: 'expense', amountCents: 40_00, sourceAccountId: 'cash', categoryId: 'groceries' }));

		await service.updateMovement({
			...movement({ type: 'expense', amountCents: 80_00, sourceAccountId: 'debit', categoryId: 'groceries' }),
			id: expense.id
		});

		expect(accounts.get('cash')?.balanceCents).toBe(100_00);
		expect(accounts.get('debit')?.balanceCents).toBe(120_00);
	});

	it('soft deletes movements and reverses their original balance impact', async () => {
		const income = await service.createMovement(movement({ type: 'income', amountCents: 25_00, destinationAccountId: 'cash' }));

		await service.deleteMovement(income.id);

		expect(accounts.get('cash')?.balanceCents).toBe(100_00);
		expect((await movementRepository.findById(income.id))?.active).toBe(false);
	});
});

function movement(overrides: Partial<CreateMovementInput> = {}): CreateMovementInput {
	return {
		type: 'expense',
		title: 'Movement',
		description: null,
		amountCents: 10_00,
		currencyCode: 'MXN',
		occurredAt,
		sourceAccountId: null,
		destinationAccountId: null,
		categoryId: null,
		recurringExpenseId: null,
		recurringIncomeId: null,
		loanId: null,
		...overrides
	};
}

function loan(overrides: Partial<Loan>): Loan {
	return {
		id: 'loan',
		name: 'Loan',
		direction: 'borrowed',
		counterpartyName: 'Counterparty',
		principalAmountCents: 100_00,
		totalRepaymentCents: 120_00,
		installmentCount: 3,
		firstPaymentDate: '2026-10-01',
		currencyCode: 'MXN',
		status: 'active',
		createdAt: now,
		updatedAt: now,
		cancelledAt: null,
		...overrides
	};
}

function account(overrides: Partial<Account>): Account {
	return {
		id: 'account',
		name: 'Account',
		type: 'personal',
		bankId: null,
		bank: null,
		cardLastFourDigits: null,
		cardColor: null,
		balanceCents: 0,
		balanceAsOfDate: '2026-09-01',
		creditLimitCents: null,
		statementDay: null,
		paymentDueDay: null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		adjustments: [],
		...overrides
	};
}

function category(id: string): Category {
	return {
		id,
		name: 'Groceries',
		color: '#2f80ed',
		parentId: null,
		isEssential: true,
		createdAt: now,
		updatedAt: now
	};
}

function recurringExpense(id: string, categoryId: string): RecurringExpense {
	return {
		id,
		name: 'Rent',
		categoryId,
		category: {
			id: categoryId,
			name: 'Groceries',
			color: '#2f80ed',
			isEssential: true
		},
		paymentAccountId: null,
		paymentAccount: null,
		amountCents: 60_00,
		amountKind: 'fixed',
		frequency: 'monthly',
		customIntervalCount: null,
		customIntervalUnit: null,
		paymentSchedule: { type: 'monthly', day: 1 },
		statementDay: null,
		lastPaidAt: null,
		nextOccurrenceAt: null,
		isActive: true,
		createdAt: now,
		updatedAt: now
	};
}

function recurringIncome(id: string): RecurringIncome {
	return {
		id,
		title: 'Payroll',
		expectedAmountCents: 90_00,
		source: 'work',
		frequency: 'monthly',
		paymentSchedule: { type: 'monthly', day: 15 },
		workSchedule: null,
		isActive: true,
		createdAt: now,
		updatedAt: now
	};
}
