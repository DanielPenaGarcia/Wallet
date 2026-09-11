import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import {
	CategoryHasActiveChildrenError,
	CategoryNameAlreadyExistsError,
	CategoryNotFoundError,
	ParentCategoryNotFoundError
} from './category.errors';
import { toCategory, toCategoryTree } from './category.mapper';
import {
	findActiveCategoryById,
	insertCategory,
	listActiveCategoryRecords,
	softDeleteCategoryRecord,
	updateCategoryRecord
} from './category.repository';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

export async function getCategoryTree(): Promise<CategoryNode[]> {
	return toCategoryTree(await listActiveCategoryRecords());
}

export async function getCategoryOptions(): Promise<Category[]> {
	return (await listActiveCategoryRecords()).map(toCategory);
}

export async function createCategory(input: CreateCategoryInput): Promise<void> {
	const categories = await listActiveCategoryRecords();
	if (input.parentId !== null && !(await findActiveCategoryById(input.parentId))) {
		throw new ParentCategoryNotFoundError();
	}
	const duplicated = categories.some(
		(category) =>
			category.parentId === input.parentId && normalizeName(category.name) === normalizeName(input.name)
	);
	if (duplicated) throw new CategoryNameAlreadyExistsError();
	await insertCategory(input);
}

export async function updateCategory(input: UpdateCategoryInput): Promise<void> {
	const current = await findActiveCategoryById(input.id);
	if (!current) throw new CategoryNotFoundError();
	const categories = await listActiveCategoryRecords();
	const duplicated = categories.some(
		(category) =>
			category.id !== input.id &&
			category.parentId === current.parentId &&
			normalizeName(category.name) === normalizeName(input.name)
	);
	if (duplicated) throw new CategoryNameAlreadyExistsError();
	await updateCategoryRecord(input);
}

export async function deleteCategory(id: string): Promise<void> {
	if (!(await findActiveCategoryById(id))) throw new CategoryNotFoundError();
	const categories = await listActiveCategoryRecords();
	if (categories.some((category) => category.parentId === id)) {
		throw new CategoryHasActiveChildrenError();
	}
	await softDeleteCategoryRecord(id);
}
