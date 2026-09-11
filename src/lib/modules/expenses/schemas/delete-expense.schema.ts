import { z } from 'zod';

export const deleteExpenseSchema = z.object({
	id: z.string().trim().min(1, 'El gasto es obligatorio.')
});
