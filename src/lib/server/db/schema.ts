import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
	parentId: text('parent_id').references((): typeof categories.id => categories.id, {
		onDelete: 'cascade'
	}),
	isEssential: integer('is_essential', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
