import { z } from 'zod';
import { createExpenseSchema } from './create-expense.schema';

export const updateExpenseSchema = createExpenseSchema.safeExtend({
	id: z.string().trim().min(1, 'El gasto es obligatorio.')
});
