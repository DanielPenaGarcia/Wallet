import { z } from 'zod';
import { createCardSchema } from './create-card.schema';

export const updateCardSchema = z.intersection(
	createCardSchema,
	z.object({ id: z.string().trim().min(1, 'La cuenta es obligatoria.') })
);

export type UpdateCardData = z.infer<typeof updateCardSchema>;
