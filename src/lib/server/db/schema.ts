import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

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
