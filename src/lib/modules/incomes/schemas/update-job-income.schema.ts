import { z } from 'zod';
import { jobIncomeFields } from './create-job-income.schema';

export const updateJobIncomeSchema = z
	.object({
		id: z.string().trim().min(1, 'El ingreso es obligatorio.'),
		...jobIncomeFields
	})
	.superRefine((data, context) => {
		if (data.hasSchedule && !data.schedule) {
			context.addIssue({
				code: 'custom',
				path: ['schedule'],
				message: 'El horario es obligatorio cuando está habilitado.'
			});
		}
	})
	.transform(({ hasSchedule, schedule, ...data }) => ({
		...data,
		schedule: hasSchedule ? (schedule ?? '').trim() : null
	}));
