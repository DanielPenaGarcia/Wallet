import { foreignKey, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import {
	expenseAmountKinds,
	expenseClassifications,
	expenseFrequencies,
	expenseIntervalUnits
} from '$lib/modules/expenses/types/expense.types';

export const banks = sqliteTable('banks', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	shortName: text('short_name'),
	countryCode: text('country_code').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	registeredAt: text('registered_at').notNull(),
	timeZone: text('time_zone').notNull(),
	weekendDays: text('weekend_days').notNull().default('[0,6]'),
	holidays: text('holidays').notNull().default('[]')
});

export const cards = sqliteTable('cards', {
	id: text('id').primaryKey(),
	kind: text('kind', { enum: ['debit', 'credit'] }).notNull(),
	registeredAt: text('registered_at').notNull(),
	alias: text('alias').notNull(),
	bankId: text('bank_id')
		.notNull()
		.references(() => banks.id, { onDelete: 'restrict' }),
	color: text('color').notNull(),
	lastFourDigits: text('last_four_digits').notNull(),
	currencyCode: text('currency_code').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true)
});

export const debitCards = sqliteTable('debit_cards', {
	cardId: text('card_id')
		.primaryKey()
		.references(() => cards.id, { onDelete: 'cascade' }),
	accountId: text('account_id').notNull(),
	initialLedgerBalance: integer('initial_ledger_balance').notNull(),
	ledgerBalance: integer('ledger_balance').notNull(),
	availableBalance: integer('available_balance').notNull()
});

export const creditCards = sqliteTable('credit_cards', {
	cardId: text('card_id')
		.primaryKey()
		.references(() => cards.id, { onDelete: 'cascade' }),
	maximumOfferedCredit: integer('maximum_offered_credit').notNull(),
	initialBalance: integer('initial_balance').notNull(),
	currentBalance: integer('current_balance').notNull(),
	statementDay: integer('statement_day').notNull(),
	paymentDueDay: integer('payment_due_day').notNull()
});

export const categories = sqliteTable(
	'categories',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		color: text('color').notNull(),
		parentId: text('parent_id'),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		registeredAt: text('registered_at').notNull(),
		updatedAt: text('updated_at'),
		deletedAt: text('deleted_at')
	},
	(table) => [
		foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }).onDelete('restrict')
	]
);

export const jobIncomes = sqliteTable('job_incomes', {
	id: text('id').primaryKey(),
	jobName: text('job_name').notNull(),
	monthlyAmount: integer('monthly_amount').notNull(),
	amountType: text('amount_type', { enum: ['gross', 'net'] }).notNull(),
	paymentFrequency: text('payment_frequency', {
		enum: ['weekly', 'semimonthly', 'monthly']
	}).notNull(),
	schedule: text('schedule'),
	currencyCode: text('currency_code').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	registeredAt: text('registered_at').notNull(),
	updatedAt: text('updated_at'),
	deletedAt: text('deleted_at')
});

export const expenses = sqliteTable('expenses', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	classification: text('classification', {
		enum: expenseClassifications
	}).notNull(),
	frequency: text('frequency', {
		enum: expenseFrequencies
	}).notNull(),
	customIntervalCount: integer('custom_interval_count'),
	customIntervalUnit: text('custom_interval_unit', { enum: expenseIntervalUnits }),
	amountKind: text('amount_kind', { enum: expenseAmountKinds }).notNull().default('fixed'),
	amount: integer('amount').notNull(),
	currencyCode: text('currency_code').notNull(),
	statementDay: integer('statement_day'),
	paymentDueDay: integer('payment_due_day'),
	categoryId: text('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'restrict' }),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	registeredAt: text('registered_at').notNull(),
	updatedAt: text('updated_at'),
	deletedAt: text('deleted_at')
});

export const expenseAmountChanges = sqliteTable('expense_amount_changes', {
	id: text('id').primaryKey(),
	expenseId: text('expense_id')
		.notNull()
		.references(() => expenses.id, { onDelete: 'cascade' }),
	previousAmount: integer('previous_amount'),
	newAmount: integer('new_amount').notNull(),
	direction: text('direction', { enum: ['initial', 'increase', 'decrease'] }).notNull(),
	changedAt: text('changed_at').notNull()
});

export const expensePayments = sqliteTable('expense_payments', {
	id: text('id').primaryKey(),
	expenseId: text('expense_id')
		.notNull()
		.references(() => expenses.id, { onDelete: 'cascade' }),
	mode: text('mode', { enum: ['paid', 'card'] }).notNull(),
	amount: integer('amount').notNull(),
	currencyCode: text('currency_code').notNull(),
	note: text('note'),
	cardId: text('card_id').references(() => cards.id, { onDelete: 'restrict' }),
	movementId: text('movement_id').references(() => movements.id, { onDelete: 'set null' }),
	paidAt: text('paid_at').notNull(),
	registeredAt: text('registered_at').notNull()
});

export const financialGoals = sqliteTable('financial_goals', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	targetAmount: integer('target_amount').notNull(),
	allocationPercentage: integer('allocation_percentage').notNull(),
	currencyCode: text('currency_code').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	registeredAt: text('registered_at').notNull(),
	updatedAt: text('updated_at'),
	deletedAt: text('deleted_at')
});

export const movements = sqliteTable('movements', {
	id: text('id').primaryKey(),
	type: text('type', { enum: ['expense', 'income', 'transfer'] }).notNull(),
	title: text('title').notNull(),
	reason: text('reason'),
	amount: integer('amount').notNull(),
	currencyCode: text('currency_code').notNull(),
	paymentMode: text('payment_mode', { enum: ['cash', 'installments'] }),
	installmentCount: integer('installment_count'),
	interestFree: integer('interest_free', { mode: 'boolean' }).notNull().default(false),
	occurredAt: text('occurred_at').notNull(),
	sourceCardId: text('source_card_id').references(() => cards.id, { onDelete: 'restrict' }),
	destinationCardId: text('destination_card_id').references(() => cards.id, {
		onDelete: 'restrict'
	}),
	expenseId: text('expense_id').references(() => expenses.id, { onDelete: 'restrict' }),
	categoryId: text('category_id').references(() => categories.id, { onDelete: 'restrict' }),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	registeredAt: text('registered_at').notNull(),
	updatedAt: text('updated_at'),
	deletedAt: text('deleted_at')
});

export const creditCardInstallmentPayments = sqliteTable(
	'credit_card_installment_payments',
	{
		id: text('id').primaryKey(),
		movementId: text('movement_id')
			.notNull()
			.references(() => movements.id, { onDelete: 'cascade' }),
		installmentNumber: integer('installment_number').notNull(),
		paidAt: text('paid_at').notNull(),
		registeredAt: text('registered_at').notNull()
	},
	(table) => [
		uniqueIndex('credit_card_installment_payments_movement_installment_unique').on(
			table.movementId,
			table.installmentNumber
		)
	]
);
