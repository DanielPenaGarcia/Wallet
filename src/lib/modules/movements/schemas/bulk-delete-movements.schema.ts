import { z } from 'zod';

export const bulkDeleteMovementsSchema = z.object({
	ids: z.array(z.string().trim().min(1)).min(1, 'Selecciona al menos un movimiento.')
});

export type BulkDeleteMovementsData = z.infer<typeof bulkDeleteMovementsSchema>;
