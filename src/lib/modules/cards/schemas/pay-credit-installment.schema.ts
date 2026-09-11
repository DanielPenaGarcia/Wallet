import { z } from 'zod';

export const payCreditInstallmentSchema = z.object({
	cardId: z.string().trim().min(1, 'La tarjeta es obligatoria.'),
	movementId: z.string().trim().min(1, 'La compra es obligatoria.'),
	installmentNumber: z.coerce.number().int().min(1, 'La mensualidad es obligatoria.')
});

export type PayCreditInstallmentData = z.infer<typeof payCreditInstallmentSchema>;
