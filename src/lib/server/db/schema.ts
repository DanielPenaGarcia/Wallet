import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const banks = sqliteTable('banks', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	alias: text('alias').notNull(),
	color: text('color').notNull()
});

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	color: text('color'),
	parentId: text('parent_id').references((): AnySQLiteColumn => categories.id, {
		onDelete: 'cascade'
	}),
	isEssential: integer('is_essential', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const colorPalettes = sqliteTable('color_palettes', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	primary: text('primary').notNull(),
	secondary: text('secondary').notNull(),
	tertiary: text('tertiary').notNull(),
	background: text('background').notNull(),
	surface: text('surface').notNull(),
	isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const recurringIncomes = sqliteTable('recurring_incomes', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	expectedAmountCents: integer('expected_amount_cents').notNull(),
	source: text('source').notNull(),
	frequency: text('frequency').notNull(),
	paymentSchedule: text('payment_schedule').notNull(),
	workSchedule: text('work_schedule'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const recurringExpenses = sqliteTable('recurring_expenses', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	categoryId: text('category_id').notNull().references(() => categories.id),
	amountCents: integer('amount_cents').notNull(),
	amountKind: text('amount_kind').notNull(),
	frequency: text('frequency').notNull(),
	customIntervalCount: integer('custom_interval_count'),
	customIntervalUnit: text('custom_interval_unit'),
	paymentSchedule: text('payment_schedule').notNull(),
	statementDay: integer('statement_day'),
	lastPaidAt: text('last_paid_at'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const financialGoals = sqliteTable('financial_goals', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	targetAmountCents: integer('target_amount_cents').notNull(),
	currentAmountCents: integer('current_amount_cents').notNull().default(0),
	distributionPercentage: integer('distribution_percentage').notNull().default(0),
	currencyCode: text('currency_code').notNull().default('MXN'),
	priority: text('priority').notNull(),
	status: text('status').notNull(),
	type: text('type').notNull(),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const accounts = sqliteTable('accounts', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	type: text('type').notNull(),
	bankId: text('bank_id').references(() => banks.id),
	cardLastFourDigits: text('card_last_four_digits'),
	cardColor: text('card_color'),
	balanceCents: integer('balance_cents').notNull().default(0),
	creditLimitCents: integer('credit_limit_cents'),
	statementDay: integer('statement_day'),
	paymentDueDay: integer('payment_due_day'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const accountAdjustments = sqliteTable('account_adjustments', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	previousBalanceCents: integer('previous_balance_cents').notNull(),
	newBalanceCents: integer('new_balance_cents').notNull(),
	differenceCents: integer('difference_cents').notNull(),
	reason: text('reason').notNull(),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const installmentPurchases = sqliteTable('installment_purchases', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	description: text('description').notNull(),
	purchaseDate: text('purchase_date').notNull(),
	originalAmountCents: integer('original_amount_cents').notNull(),
	installmentAmountCents: integer('installment_amount_cents').notNull(),
	totalInstallments: integer('total_installments').notNull(),
	billedInstallments: integer('billed_installments').notNull().default(0),
	paidInstallments: integer('paid_installments').notNull().default(0),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const creditCardStatements = sqliteTable('credit_card_statements', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	periodStartDate: text('period_start_date').notNull(),
	periodEndDate: text('period_end_date').notNull(),
	statementDate: text('statement_date').notNull(),
	paymentDueDate: text('payment_due_date').notNull(),
	statementBalanceCents: integer('statement_balance_cents').notNull(),
	paidAmountCents: integer('paid_amount_cents').notNull().default(0),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
	uniqueIndex('credit_card_statements_account_statement_date_unique').on(
		table.accountId,
		table.statementDate
	)
]);
