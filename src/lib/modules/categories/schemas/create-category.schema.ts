import { z } from 'zod';
import type { CategoryColor } from '../types/category.types';

export const createCategorySchema = z.object({
	name: z.string().trim().min(1, 'El nombre es obligatorio.').max(60),
	color: z.custom<CategoryColor>(
		(value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
		'Selecciona un color válido.'
	),
	parentId: z.string().trim().transform((value) => (value === '' || value === '__root__' ? null : value))
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
