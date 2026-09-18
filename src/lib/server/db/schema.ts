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
