import { z } from 'zod';
import { createBankSchema } from './create-bank.schema';

export const updateBankSchema = createBankSchema.extend({
	id: z.string().trim().min(1, 'El banco es obligatorio.')
});
