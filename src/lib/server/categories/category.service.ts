import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import { colorInputToHex } from '$lib/shared/utils/color';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import {
	CategoryInUseError,
	CategoryNameAlreadyExistsError,
	CategoryNotFoundError,
	ParentCategoryNotFoundError
} from './category.errors';
import type { CategoryRepository } from './category.repository';
import { drizzleCategoryRepository } from './drizzle-category.repository';
import type { CreateCategoryInput } from './inputs/create-category.input';
import type { UpdateCategoryInput } from './inputs/update-category.input';

export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	getCategories(): Promise<Category[]> {
		return this.categoryRepository.list();
	}

	async getCategoryTree(): Promise<CategoryNode[]> {
		return this.buildCategoryTree(await this.getCategories());
	}

	buildCategoryTree(categories: Category[]): CategoryNode[] {
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

	async createCategory(input: CreateCategoryInput): Promise<void> {
		const normalizedInput = this.normalizeCategoryInput(input);
		if (normalizedInput.parentId && !(await this.categoryRepository.findById(normalizedInput.parentId))) {
			throw new ParentCategoryNotFoundError();
		}

		await this.assertUniqueCategoryName(normalizedInput.name, normalizedInput.parentId);
		await this.categoryRepository.create(normalizedInput);
	}

	async updateCategory(input: UpdateCategoryInput): Promise<void> {
		const category = await this.categoryRepository.findById(input.id);
		if (!category) throw new CategoryNotFoundError();

		const normalizedInput = this.normalizeCategoryInput({
			...input,
			parentId: category.parentId
		});
		await this.assertUniqueCategoryName(normalizedInput.name, category.parentId, input.id);
		await this.categoryRepository.update({ ...normalizedInput, id: input.id });
	}

	async deleteCategory(id: string): Promise<void> {
		if (!(await this.categoryRepository.findById(id))) throw new CategoryNotFoundError();
		if (
			(await this.categoryRepository.hasChildren(id)) ||
			(await this.categoryRepository.hasRecurringExpenses(id))
		) {
			throw new CategoryInUseError();
		}
		await this.categoryRepository.delete(id);
	}

	private normalizeCategoryInput<T extends CreateCategoryInput>(input: T): T {
		const parentId = input.parentId?.trim() || null;
		const color = parentId ? null : colorInputToHex(input.color ?? '') ?? input.color?.trim() ?? null;

		return {
			...input,
			name: input.name.trim(),
			color,
			parentId
		};
	}

	private async assertUniqueCategoryName(name: string, parentId: string | null, ignoredId?: string) {
		const normalizedName = normalizeName(name);
		const duplicated = (await this.categoryRepository.list()).some(
			(category) =>
				category.id !== ignoredId &&
				category.parentId === parentId &&
				normalizeName(category.name) === normalizedName
		);
		if (duplicated) throw new CategoryNameAlreadyExistsError();
	}
}

export const categoryService = new CategoryService(drizzleCategoryRepository);
