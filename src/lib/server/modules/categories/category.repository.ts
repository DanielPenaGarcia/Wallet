import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

export async function findCategoryById(id: string) {
	return db.query.categories.findFirst({
		where: (category, { eq }) => eq(category.id, id)
	});
}

export async function listCategories() {
	return db.select({
		id: categories.id,
		name: categories.name,
		color: categories.color,
		parentId: categories.parentId,
		isEssential: categories.isEssential,
		createdAt: categories.createdAt,
		updatedAt: categories.updatedAt
	}).from(categories).orderBy(asc(categories.name));
}

export async function insertCategory(input: CreateCategoryInput) {
	const category = {
		id: crypto.randomUUID(),
		name: input.name,
		color: input.color,
		parentId: input.parentId,
		isEssential: input.isEssential,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	await db.insert(categories).values(category);
	return category;
}

export async function updateCategoryRecord(input: UpdateCategoryInput): Promise<void> {
	await db.update(categories).set({
		name: input.name,
		color: input.color,
		isEssential: input.isEssential,
		updatedAt: new Date().toISOString()
	}).where(eq(categories.id, input.id));
}

export async function deleteCategoryRecord(id: string): Promise<void> {
	await db.delete(categories).where(eq(categories.id, id));
}
