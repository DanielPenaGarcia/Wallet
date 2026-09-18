import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const banks = sqliteTable('banks', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	alias: text('alias').notNull(),
	color: text('color').notNull()
});
