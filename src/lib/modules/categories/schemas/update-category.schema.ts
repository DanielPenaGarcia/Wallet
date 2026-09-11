import { z } from 'zod';
import type { CategoryColor } from '../types/category.types';
import { isCategoryColor, normalizeCategoryColor } from '../utils/category-color';

export const updateCategorySchema = z.object({
	id: z.string().trim().min(1, 'La categoría es obligatoria.'),
	name: z.string().trim().min(1, 'El nombre es obligatorio.').max(60),
	color: z
		.string()
		.trim()
		.refine(isCategoryColor, 'Ingresa un color hexadecimal o RGB válido.')
		.transform((value) => normalizeCategoryColor(value) as CategoryColor)
});
