import { z } from 'zod';

export const deleteCategorySchema = z.object({
	id: z.string().trim().min(1, 'La categoría es obligatoria.')
});
