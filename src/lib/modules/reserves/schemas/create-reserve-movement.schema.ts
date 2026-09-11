import { z } from 'zod';
import { reserveMovementKinds } from '../types/reserve-movement.types';

export const createReserveMovementSchema = z.object({
	reserveKind: z.enum(reserveMovementKinds),
	targetId: z.string().trim().min(1, 'Selecciona un apartado.'),
	sourceCardId: z.string().trim().min(1, 'Selecciona la cuenta de origen.')
});
