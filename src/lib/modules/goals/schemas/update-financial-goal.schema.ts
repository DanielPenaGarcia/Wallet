import { z } from 'zod';
import { createFinancialGoalSchema } from './create-financial-goal.schema';

export const updateFinancialGoalSchema = createFinancialGoalSchema.extend({
	id: z.string().trim().min(1, 'El objetivo es obligatorio.')
});
