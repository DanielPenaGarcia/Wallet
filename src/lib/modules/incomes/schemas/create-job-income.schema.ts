import { z } from 'zod';
import { currencyCodeSchema } from '$lib/shared/schemas/currency-code.schema';
import { positiveMoneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';

const monthlyAmountSchema = positiveMoneyAmountSchema(
	'El ingreso mensual debe ser mayor que cero.'
);

const jobIncomeFields = {
	jobName: z.string().trim().min(1, 'El nombre del trabajo es obligatorio.').max(80),
	monthlyAmount: monthlyAmountSchema,
	amountType: z.enum(['gross', 'net']),
	paymentFrequency: z.enum(['weekly', 'semimonthly', 'monthly']),
	hasSchedule: z
		.preprocess((value) => value === true || value === 'on' || value === 'true', z.boolean())
		.default(false),
	schedule: z.string().trim().max(220, 'El horario no puede superar 220 caracteres.').optional(),
	currencyCode: currencyCodeSchema()
};

export const createJobIncomeSchema = z
	.object(jobIncomeFields)
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

export type CreateJobIncomeData = z.infer<typeof createJobIncomeSchema>;
export { jobIncomeFields };
