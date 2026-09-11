import { z } from 'zod';
import { createMovementSchema } from './create-movement.schema';

export const updateMovementSchema = z.intersection(
	createMovementSchema,
	z.object({ id: z.string().trim().min(1, 'El movimiento es obligatorio.') })
);
