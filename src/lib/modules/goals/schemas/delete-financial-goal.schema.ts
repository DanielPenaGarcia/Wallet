import { z } from 'zod';

export const deleteFinancialGoalSchema = z.object({
	id: z.string().trim().min(1, 'El objetivo es obligatorio.')
});
