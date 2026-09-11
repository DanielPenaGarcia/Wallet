import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

export async function findActiveCategoryById(id: string) {
	return db.query.categories.findFirst({
		where: (category, { and, eq }) => and(eq(category.id, id), eq(category.active, true))
	});
}

export async function listActiveCategoryRecords() {
	return db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.name));
}

export async function insertCategory(input: CreateCategoryInput) {
	const now = new Date().toISOString();
	await db.insert(categories).values({
		id: crypto.randomUUID(),
		name: input.name,
		color: input.color,
		parentId: input.parentId,
		active: true,
		registeredAt: now,
		updatedAt: now,
		deletedAt: null
	});
}

export async function updateCategoryRecord(input: UpdateCategoryInput) {
	await db
		.update(categories)
		.set({ name: input.name, color: input.color, updatedAt: new Date().toISOString() })
		.where(eq(categories.id, input.id));
}

export async function softDeleteCategoryRecord(id: string) {
	const deletedAt = new Date().toISOString();
	await db
		.update(categories)
		.set({ active: false, deletedAt, updatedAt: deletedAt })
		.where(eq(categories.id, id));
}
