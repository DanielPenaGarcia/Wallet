import { z } from 'zod';
import { createMovementSchema } from './create-movement.schema';

export const bulkCreateMovementsSchema = z.object({
	movements: z
		.string()
		.trim()
		.min(1, 'Agrega al menos un movimiento.')
		.transform((value, context) => {
			try {
				return JSON.parse(value) as unknown;
			} catch {
				context.addIssue({
					code: 'custom',
					message: 'El respaldo del lote no tiene un formato válido.'
				});
				return z.NEVER;
			}
		})
		.pipe(z.array(createMovementSchema).min(1, 'Agrega al menos un movimiento.').max(100, 'Puedes registrar hasta 100 movimientos por lote.'))
});
