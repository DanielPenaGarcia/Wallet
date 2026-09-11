import { z } from 'zod';
import { dateTimeLocalSchema } from '$lib/shared/schemas/date-time-local.schema';
import { positiveMoneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';

export const payExpenseSchema = z
	.object({
		expenseId: z.string().trim().min(1, 'El gasto es obligatorio.'),
		mode: z.enum(['paid', 'card']),
		amount: positiveMoneyAmountSchema('El monto pagado debe ser mayor que cero.'),
		paidAt: dateTimeLocalSchema('La fecha de pago es obligatoria.', 'Ingresa una fecha válida.'),
		note: z.string().trim().max(180, 'La nota no puede superar 180 caracteres.').optional(),
		cardId: z.string().trim().optional()
	})
	.superRefine((data, context) => {
		if (data.mode === 'card' && !data.cardId) {
			context.addIssue({
				code: 'custom',
				path: ['cardId'],
				message: 'Selecciona la tarjeta con la que pagaste.'
			});
		}
	})
	.transform((data) => ({
		...data,
		note: data.note?.trim() ? data.note.trim() : null,
		cardId: data.mode === 'card' ? (data.cardId ?? '') : null
	}));

export type PayExpenseData = z.infer<typeof payExpenseSchema>;
