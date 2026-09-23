import { beforeEach, describe, expect, it } from 'vitest';
import DatabaseClient from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import type { CategoryRepository } from '$lib/server/categories/category.repository';
import * as schema from '$lib/server/db/schema';
import { DrizzleRecurringExpenseRepository } from '$lib/server/recurring-expenses/drizzle-recurring-expense.repository';
import type { CreateRecurringExpenseInput } from '$lib/server/recurring-expenses/inputs/create-recurring-expense.input';
import type { UpdateRecurringExpenseInput } from '$lib/server/recurring-expenses/inputs/update-recurring-expense.input';
import { RecurringExpenseValidationError } from '$lib/server/recurring-expenses/recurring-expense.errors';
import type { RecurringExpenseRepository } from '$lib/server/recurring-expenses/recurring-expense.repository';
import { RecurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';

const now = '2026-09-23T12:00:00.000Z';

class InMemoryRecurringExpenseRepository implements RecurringExpenseRepository {
	private readonly expenses = new Map<string, RecurringExpense>();

	findById(id: string) {
		return Promise.resolve(this.expenses.get(id));
	}

	list() {
		return Promise.resolve(Array.from(this.expenses.values()));
	}

	async create(input: CreateRecurringExpenseInput) {
		const expense = recurringExpense(`expense-${this.expenses.size + 1}`, input);
		this.expenses.set(expense.id, expense);
		return expense;
	}

	async update(input: UpdateRecurringExpenseInput) {
		this.expenses.set(input.id, recurringExpense(input.id, input));
	}

	async delete(id: string) {
		this.expenses.delete(id);
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
		throw new Error('Not used in recurring expense tests.');
	}

	async update() {
		throw new Error('Not used in recurring expense tests.');
	}

	async delete() {
		throw new Error('Not used in recurring expense tests.');
	}
}

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
		throw new Error('Not used in recurring expense tests.');
	}

	async create(): Promise<Account> {
		throw new Error('Not used in recurring expense tests.');
	}

	async update() {
		throw new Error('Not used in recurring expense tests.');
	}

	async updateActive() {
		throw new Error('Not used in recurring expense tests.');
	}

	async delete() {
		throw new Error('Not used in recurring expense tests.');
	}
}

describe('recurring expense payment accounts', () => {
	let repository: InMemoryRecurringExpenseRepository;
	let service: RecurringExpenseService;

	beforeEach(() => {
		repository = new InMemoryRecurringExpenseRepository();
		service = new RecurringExpenseService(
			repository,
			new InMemoryCategoryRepository(new Map([['category', category('category')]])),
			new InMemoryAccountRepository(new Map([
				['debit', account('debit', 'debit')],
				['credit', account('credit', 'credit')],
				['personal', account('personal', 'personal')],
				['inactive', { ...account('inactive', 'debit'), isActive: false }]
			]))
		);
	});

	it('creates recurring expenses with debit and credit payment accounts', async () => {
		await service.createRecurringExpense(input({ paymentAccountId: 'debit' }));
		await service.createRecurringExpense(input({ paymentAccountId: 'credit' }));

		const [debitExpense, creditExpense] = await repository.list();
		expect(debitExpense.paymentAccountId).toBe('debit');
		expect(creditExpense.paymentAccountId).toBe('credit');
	});

	it('keeps the payment account optional for existing or unassigned expenses', async () => {
		await service.createRecurringExpense(input({ paymentAccountId: null }));

		const [expense] = await repository.list();
		expect(expense.paymentAccountId).toBeNull();
	});

	it('rejects nonexistent, personal, and inactive payment accounts', async () => {
		await expect(service.createRecurringExpense(input({ paymentAccountId: 'missing' }))).rejects.toMatchObject({
			errors: { paymentAccountId: ['Selecciona una cuenta existente.'] }
		} satisfies Partial<RecurringExpenseValidationError>);
		await expect(service.createRecurringExpense(input({ paymentAccountId: 'personal' }))).rejects.toMatchObject({
			errors: { paymentAccountId: ['Selecciona una cuenta de débito o crédito.'] }
		} satisfies Partial<RecurringExpenseValidationError>);
		await expect(service.createRecurringExpense(input({ paymentAccountId: 'inactive' }))).rejects.toMatchObject({
			errors: { paymentAccountId: ['Selecciona una cuenta activa.'] }
		} satisfies Partial<RecurringExpenseValidationError>);
	});

	it('persists, reads, updates, and groups payment accounts by account type', async () => {
		const sqlite = new DatabaseClient(':memory:');
		sqlite.exec(`
			PRAGMA foreign_keys = ON;
			CREATE TABLE banks (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				alias TEXT NOT NULL,
				color TEXT NOT NULL
			);
			CREATE TABLE categories (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				color TEXT,
				parent_id TEXT,
				is_essential INTEGER DEFAULT false NOT NULL,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
			);
			CREATE TABLE accounts (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				type TEXT NOT NULL,
				bank_id TEXT REFERENCES banks(id),
				card_last_four_digits TEXT,
				card_color TEXT,
				balance_cents INTEGER DEFAULT 0 NOT NULL,
				balance_as_of_date TEXT DEFAULT '2026-09-21' NOT NULL,
				credit_limit_cents INTEGER,
				statement_day INTEGER,
				payment_due_day INTEGER,
				is_active INTEGER DEFAULT true NOT NULL,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
			);
			CREATE TABLE recurring_expenses (
				id TEXT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				category_id TEXT NOT NULL REFERENCES categories(id),
				payment_account_id TEXT REFERENCES accounts(id),
				amount_cents INTEGER NOT NULL,
				amount_kind TEXT NOT NULL,
				frequency TEXT NOT NULL,
				custom_interval_count INTEGER,
				custom_interval_unit TEXT,
				payment_schedule TEXT NOT NULL,
				statement_day INTEGER,
				last_paid_at TEXT,
				is_active INTEGER DEFAULT true NOT NULL,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
			);
		`);

		const database = drizzle(sqlite, { schema });
		await database.insert(schema.banks).values({ id: 'bank', name: 'Bank', alias: 'BNK', color: '#123456' });
		await database.insert(schema.categories).values(category('category'));
		await database.insert(schema.accounts).values([
			{
				id: 'debit',
				name: 'Debit',
				type: 'debit',
				bankId: 'bank',
				cardLastFourDigits: '1234',
				cardColor: '#123456',
				balanceCents: 0,
				balanceAsOfDate: '2026-09-21',
				creditLimitCents: null,
				statementDay: null,
				paymentDueDay: null,
				isActive: true,
				createdAt: now,
				updatedAt: now
			},
			{
				id: 'credit',
				name: 'Credit',
				type: 'credit',
				bankId: 'bank',
				cardLastFourDigits: null,
				cardColor: '#654321',
				balanceCents: 0,
				balanceAsOfDate: '2026-09-21',
				creditLimitCents: 10_000_00,
				statementDay: 15,
				paymentDueDay: 5,
				isActive: true,
				createdAt: now,
				updatedAt: now
			}
		]);

		const drizzleRepository = new DrizzleRecurringExpenseRepository(database);
		const created = await drizzleRepository.create(input({ paymentAccountId: 'debit' }));
		await drizzleRepository.create(input({ name: 'Unassigned', paymentAccountId: null }));
		expect(created.paymentAccount).toMatchObject({ id: 'debit', type: 'debit', bank: { alias: 'BNK' } });

		await drizzleRepository.update({ id: created.id, ...input({ paymentAccountId: 'credit' }) });
		const updated = await drizzleRepository.findById(created.id);
		const grouped = await new RecurringExpenseService(
			drizzleRepository,
			new InMemoryCategoryRepository(new Map()),
			new InMemoryAccountRepository(new Map())
		).getRecurringExpensesByPaymentAccountType();

		expect(updated?.paymentAccount).toMatchObject({ id: 'credit', type: 'credit' });
		expect(grouped.credit.map((expense) => expense.id)).toContain(created.id);
		expect(grouped.unassigned).toHaveLength(1);
	});
});

function input(overrides: Partial<CreateRecurringExpenseInput> = {}): CreateRecurringExpenseInput {
	return {
		name: overrides.name ?? 'Internet',
		categoryId: 'category',
		paymentAccountId: 'debit',
		amountCents: 499_00,
		amountKind: 'fixed',
		frequency: 'monthly',
		customIntervalCount: null,
		customIntervalUnit: null,
		paymentSchedule: { type: 'monthly', day: 15 },
		statementDay: null,
		lastPaidAt: null,
		isActive: true,
		...overrides
	};
}

function category(id: string): Category {
	return {
		id,
		name: 'Services',
		color: '#2f80ed',
		parentId: null,
		isEssential: true,
		createdAt: now,
		updatedAt: now
	};
}

function account(id: string, type: Account['type']): Account {
	return {
		id,
		name: type === 'personal' ? 'Efectivo' : id,
		type,
		bankId: type === 'personal' ? null : 'bank',
		bank: type === 'personal' ? null : { id: 'bank', name: 'Bank', alias: 'BNK', color: '#123456' },
		cardLastFourDigits: type === 'debit' ? '1234' : null,
		cardColor: type === 'personal' ? null : '#123456',
		balanceCents: 0,
		balanceAsOfDate: '2026-09-21',
		creditLimitCents: type === 'credit' ? 10_000_00 : null,
		statementDay: type === 'credit' ? 15 : null,
		paymentDueDay: type === 'credit' ? 5 : null,
		isActive: true,
		createdAt: now,
		updatedAt: now,
		adjustments: []
	};
}

function recurringExpense(id: string, source: CreateRecurringExpenseInput): RecurringExpense {
	const paymentAccount = source.paymentAccountId ? account(source.paymentAccountId, source.paymentAccountId === 'credit' ? 'credit' : 'debit') : null;
	return {
		id,
		name: source.name,
		categoryId: source.categoryId,
		category: { id: source.categoryId, name: 'Services', color: '#2f80ed', isEssential: true },
		paymentAccountId: source.paymentAccountId,
		paymentAccount,
		amountCents: source.amountCents,
		amountKind: source.amountKind,
		frequency: source.frequency,
		customIntervalCount: source.customIntervalCount,
		customIntervalUnit: source.customIntervalUnit,
		paymentSchedule: source.paymentSchedule,
		statementDay: source.statementDay,
		lastPaidAt: source.lastPaidAt,
		nextOccurrenceAt: null,
		isActive: source.isActive,
		createdAt: now,
		updatedAt: now
	};
}
