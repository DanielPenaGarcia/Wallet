import { z } from 'zod';
import { currencyCodeSchema } from '$lib/shared/schemas/currency-code.schema';
import { positiveMoneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';

const allocationPercentageSchema = z
	.string()
	.trim()
	.regex(/^\d+$/, 'Ingresa un porcentaje entero.')
	.transform(Number)
	.pipe(
		z
			.number()
			.int()
			.min(1, 'El porcentaje debe ser al menos 1%.')
			.max(100, 'El porcentaje no puede ser mayor que 100%.')
	);

export const createFinancialGoalSchema = z.object({
	name: z.string().trim().min(1, 'El nombre del objetivo es obligatorio.').max(80),
	targetAmount: positiveMoneyAmountSchema('El precio total debe ser mayor que cero.'),
	allocationPercentage: allocationPercentageSchema,
	currencyCode: currencyCodeSchema()
});
