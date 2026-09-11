import { z } from 'zod';
import { currencyCodeSchema } from '$lib/shared/schemas/currency-code.schema';
import { positiveMoneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';
import {
	expenseAmountKinds,
	expenseClassifications,
	expenseFrequencies,
	expenseIntervalUnits
} from '../types/expense.types';

const amountSchema = positiveMoneyAmountSchema('El monto debe ser mayor que cero.');

const optionalDaySchema = z
	.string()
	.trim()
	.refine((value) => value === '' || /^\d{1,2}$/.test(value), 'Ingresa un día válido.')
	.transform((value) => (value === '' ? null : Number(value)))
	.pipe(z.number().int().min(1, 'El día debe estar entre 1 y 31.').max(31, 'El día debe estar entre 1 y 31.').nullable());

const customIntervalCountSchema = z
	.string()
	.trim()
	.optional()
	.transform((value) => value ?? '')
	.refine((value) => value === '' || /^\d+$/.test(value), 'Ingresa un número entero válido.')
	.transform((value) => (value === '' ? null : Number(value)))
	.pipe(
		z
			.number()
			.int()
			.min(1, 'El intervalo debe ser mayor que cero.')
			.max(999, 'El intervalo no puede ser mayor que 999.')
			.nullable()
	);

const customIntervalUnitSchema = z
	.union([z.enum(expenseIntervalUnits), z.literal('')])
	.optional()
	.transform((value) => value || null);

export const createExpenseSchema = z.object({
	name: z.string().trim().min(1, 'El nombre del gasto es obligatorio.').max(80),
	classification: z.enum(expenseClassifications),
	frequency: z.enum(expenseFrequencies),
	customIntervalCount: customIntervalCountSchema,
	customIntervalUnit: customIntervalUnitSchema,
	amountKind: z.enum(expenseAmountKinds),
	amount: amountSchema,
	currencyCode: currencyCodeSchema(),
	categoryId: z.string().trim().min(1, 'Selecciona una categoría.'),
	statementDay: optionalDaySchema,
	paymentDueDay: optionalDaySchema
}).superRefine((data, context) => {
	if (data.frequency !== 'custom') return;
	if (data.customIntervalCount === null) {
		context.addIssue({
			code: 'custom',
			path: ['customIntervalCount'],
			message: 'Indica cada cuántas veces se repite.'
		});
	}
	if (data.customIntervalUnit === null) {
		context.addIssue({
			code: 'custom',
			path: ['customIntervalUnit'],
			message: 'Selecciona días, semanas, meses o años.'
		});
	}
});

export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
