import { z } from 'zod';
import type { CategoryColor } from '../types/category.types';

export const updateCategorySchema = z.object({
	id: z.string().trim().min(1, 'La categoría es obligatoria.'),
	name: z.string().trim().min(1, 'El nombre es obligatorio.').max(60),
	color: z.custom<CategoryColor>(
		(value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
		'Selecciona un color válido.'
	)
});
