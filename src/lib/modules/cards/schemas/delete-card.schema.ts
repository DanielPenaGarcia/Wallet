import { z } from 'zod';

export const deleteCardSchema = z.object({
	id: z.string().trim().min(1, 'La tarjeta es obligatoria.')
});
