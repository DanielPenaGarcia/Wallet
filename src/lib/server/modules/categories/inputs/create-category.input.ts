import type { CategoryColor } from '$lib/modules/categories/types/category.types';

export type CreateCategoryInput = {
	name: string;
	color: CategoryColor;
	parentId: string | null;
};
