import { z } from 'zod';
import type { CategoryColor } from '../types/category.types';
import { isCategoryColor, normalizeCategoryColor } from '../utils/category-color';

export const createCategorySchema = z.object({
	name: z.string().trim().min(1, 'El nombre es obligatorio.').max(60),
	color: z
		.string()
		.trim()
		.refine(isCategoryColor, 'Ingresa un color hexadecimal o RGB válido.')
		.transform((value) => normalizeCategoryColor(value) as CategoryColor),
	parentId: z.string().trim().transform((value) => (value === '' || value === '__root__' ? null : value))
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
