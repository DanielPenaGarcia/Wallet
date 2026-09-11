import type { CategoryColor } from '../types/category.types';
import { isColorInput, normalizeColorInput } from '$lib/shared/utils/color';

export const fallbackCategoryColor: CategoryColor = '#64748b';

export function isCategoryColor(value: string): value is CategoryColor {
	return isColorInput(value);
}

export function normalizeCategoryColor(value: string): CategoryColor {
	return normalizeColorInput(value, fallbackCategoryColor) as CategoryColor;
}
