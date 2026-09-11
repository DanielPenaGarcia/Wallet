import type { CategoryColor } from '$lib/modules/categories/types/category.types';

export type UpdateCategoryInput = {
	id: string;
	name: string;
	color: CategoryColor;
};
