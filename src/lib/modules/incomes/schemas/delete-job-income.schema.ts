import { z } from 'zod';

export const deleteJobIncomeSchema = z.object({
	id: z.string().trim().min(1, 'El ingreso es obligatorio.')
});
