import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import { colorInputToHex } from '$lib/shared/utils/color';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import {
	CategoryNameAlreadyExistsError,
	CategoryNotFoundError,
	ParentCategoryNotFoundError
} from './category.errors';
import {
	deleteCategoryRecord,
	findCategoryById,
	insertCategory,
	listCategories,
	updateCategoryRecord
} from './category.repository';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

function normalizeCategoryName(name: string) {
	return normalizeName(name);
}

function normalizeCategoryInput(input: CreateCategoryInput): CreateCategoryInput {
	const parentId = input.parentId?.trim() || null;
	const color = parentId ? null : colorInputToHex(input.color ?? '') ?? input.color?.trim() ?? null;

	return {
		name: input.name.trim(),
		color,
		parentId,
		isEssential: input.isEssential
	};
}

async function assertUniqueCategoryName(name: string, parentId: string | null, ignoredId?: string) {
	const normalizedName = normalizeCategoryName(name);
	const duplicated = (await listCategories()).some(
		(category) =>
			category.id !== ignoredId &&
			category.parentId === parentId &&
			normalizeCategoryName(category.name) === normalizedName
	);
	if (duplicated) throw new CategoryNameAlreadyExistsError();
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
	const nodes = new Map<string, CategoryNode>();
	const roots: CategoryNode[] = [];

	for (const category of categories) nodes.set(category.id, { ...category, children: [] });

	for (const node of nodes.values()) {
		if (!node.parentId) {
			roots.push(node);
			continue;
		}

		const parent = nodes.get(node.parentId);
		if (parent) parent.children.push(node);
		else roots.push(node);
	}

	return roots;
}

export async function getCategories(): Promise<Category[]> {
	return listCategories();
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
	return buildCategoryTree(await getCategories());
}

export async function createCategory(input: CreateCategoryInput): Promise<void> {
	const normalizedInput = normalizeCategoryInput(input);
	if (normalizedInput.parentId && !(await findCategoryById(normalizedInput.parentId))) {
		throw new ParentCategoryNotFoundError();
	}
	await assertUniqueCategoryName(normalizedInput.name, normalizedInput.parentId);
	await insertCategory(normalizedInput);
}

export async function updateCategory(input: UpdateCategoryInput): Promise<void> {
	const category = await findCategoryById(input.id);
	if (!category) throw new CategoryNotFoundError();

	const normalizedInput = normalizeCategoryInput({
		...input,
		parentId: category.parentId
	});
	await assertUniqueCategoryName(normalizedInput.name, category.parentId, input.id);
	await updateCategoryRecord({ id: input.id, ...normalizedInput });
}

export async function deleteCategory(id: string): Promise<void> {
	if (!(await findCategoryById(id))) throw new CategoryNotFoundError();
	await deleteCategoryRecord(id);
}
