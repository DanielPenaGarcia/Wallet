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

type CategoryColorRecord = {
	id: string;
	parentId: string | null;
	color: string;
};

function effectiveCategoryColor(categoryId: string, categories: CategoryColorRecord[]) {
	const recordsById = new Map(categories.map((category) => [category.id, category]));
	let current = recordsById.get(categoryId);
	let color = current?.color;
	let guard = 0;

	while (current?.parentId && guard < categories.length) {
		const parent = recordsById.get(current.parentId);
		if (!parent) break;
		color = parent.color;
		current = parent;
		guard += 1;
	}

	return toCategory({
		id: categoryId,
		name: '',
		color: color ?? '#64748b',
		parentId: null,
		active: true,
		registeredAt: new Date().toISOString(),
		updatedAt: null,
		deletedAt: null
	}).color;
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
	return toCategoryTree(await listActiveCategoryRecords());
}

export async function getCategoryOptions(): Promise<Category[]> {
	return (await listActiveCategoryRecords()).map(toCategory);
}

export async function createCategory(input: CreateCategoryInput): Promise<void> {
	const categories = await listActiveCategoryRecords();
	let color = input.color;
	if (input.parentId !== null) {
		const parent = await findActiveCategoryById(input.parentId);
		if (!parent) throw new ParentCategoryNotFoundError();
		color = effectiveCategoryColor(parent.id, categories);
	}
	const duplicated = categories.some(
		(category) =>
			category.parentId === input.parentId && normalizeName(category.name) === normalizeName(input.name)
	);
	if (duplicated) throw new CategoryNameAlreadyExistsError();
	await insertCategory({ ...input, color });
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
	const parent = current.parentId === null ? null : await findActiveCategoryById(current.parentId);
	await updateCategoryRecord({
		...input,
		color: parent ? effectiveCategoryColor(parent.id, categories) : input.color
	});
}

export async function deleteCategory(id: string): Promise<void> {
	if (!(await findActiveCategoryById(id))) throw new CategoryNotFoundError();
	const categories = await listActiveCategoryRecords();
	if (categories.some((category) => category.parentId === id)) {
		throw new CategoryHasActiveChildrenError();
	}
	await softDeleteCategoryRecord(id);
}
