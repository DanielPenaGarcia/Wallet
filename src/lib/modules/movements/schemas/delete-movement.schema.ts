import { z } from 'zod';

export const deleteMovementSchema = z.object({
	id: z.string().trim().min(1, 'El movimiento es obligatorio.')
});
