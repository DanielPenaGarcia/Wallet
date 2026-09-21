import type { Category } from '$lib/modules/categories/types/category.types';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

export interface CategoryRepository {
	findById(id: string): Promise<Category | undefined>;
	hasChildren(id: string): Promise<boolean>;
	hasRecurringExpenses(id: string): Promise<boolean>;
	list(): Promise<Category[]>;
	create(input: CreateCategoryInput): Promise<Category>;
	update(input: UpdateCategoryInput): Promise<void>;
	delete(id: string): Promise<void>;
}
