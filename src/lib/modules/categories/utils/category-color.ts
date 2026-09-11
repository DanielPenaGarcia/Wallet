import type { CategoryColor } from '../types/category.types';

export const fallbackCategoryColor: CategoryColor = '#64748b';

export function isCategoryColor(value: string): value is CategoryColor {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeCategoryColor(value: string): CategoryColor {
	return isCategoryColor(value) ? value : fallbackCategoryColor;
}
