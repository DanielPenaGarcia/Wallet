import { z } from 'zod';

export const deleteBankSchema = z.object({
	id: z.string().trim().min(1, 'El banco es obligatorio.')
});
