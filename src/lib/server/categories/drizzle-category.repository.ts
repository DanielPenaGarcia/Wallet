import { asc, eq } from 'drizzle-orm';
import type { Category, CategoryColor } from '$lib/modules/categories/types/category.types';
import { db, type Database } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { CategoryRepository } from './category.repository';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

class DrizzleCategoryRepository implements CategoryRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const category = await this.database.query.categories.findFirst({
			where: (category, { eq }) => eq(category.id, id)
		});

		return category ? this.toCategory(category) : undefined;
	}

	async list() {
		const categoryRecords = await this.database.select({
			id: categories.id,
			name: categories.name,
			color: categories.color,
			parentId: categories.parentId,
			isEssential: categories.isEssential,
			createdAt: categories.createdAt,
			updatedAt: categories.updatedAt
		}).from(categories).orderBy(asc(categories.name));

		return categoryRecords.map((category) => this.toCategory(category));
	}

	async create(input: CreateCategoryInput): Promise<Category> {
		const now = new Date().toISOString();
		const category = {
			id: crypto.randomUUID(),
			name: input.name,
			color: input.color,
			parentId: input.parentId,
			isEssential: input.isEssential,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(categories).values(category);
		return this.toCategory(category);
	}

	async update(input: UpdateCategoryInput): Promise<void> {
		await this.database.update(categories).set({
			name: input.name,
			color: input.color,
			isEssential: input.isEssential,
			updatedAt: new Date().toISOString()
		}).where(eq(categories.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(categories).where(eq(categories.id, id));
	}

	private toCategory(category: typeof categories.$inferSelect): Category {
		return {
			id: category.id,
			name: category.name,
			color: category.color as CategoryColor | null,
			parentId: category.parentId,
			isEssential: category.isEssential,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt
		};
	}
}

export const drizzleCategoryRepository = new DrizzleCategoryRepository();
