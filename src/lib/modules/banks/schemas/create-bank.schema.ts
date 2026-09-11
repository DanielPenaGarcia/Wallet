import { z } from 'zod';

export const createBankSchema = z.object({
	name: z.string().trim().min(2, 'El nombre del banco es obligatorio.').max(100),
	shortName: z.string().trim().max(30).optional(),
	countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
	timeZone: z.string().trim().min(1, 'La zona horaria es obligatoria.').max(80)
});

export type CreateBankData = z.infer<typeof createBankSchema>;
