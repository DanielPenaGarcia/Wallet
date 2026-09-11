import { z } from 'zod';
import { dateTimeLocalSchema } from '$lib/shared/schemas/date-time-local.schema';
import { positiveMoneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';
import {
	movementClassificationKinds,
	movementPaymentModes
} from '../types/movement.types';

const installmentCountSchema = z
	.string()
	.trim()
	.optional()
	.transform((value) => value ?? '')
	.refine((value) => value === '' || /^\d+$/.test(value), 'Ingresa una cantidad válida de meses.')
	.transform((value) => (value === '' ? null : Number(value)))
	.pipe(
		z
			.number()
			.int()
			.min(2, 'Selecciona al menos 2 meses.')
			.max(120, 'El plazo no puede ser mayor a 120 meses.')
			.nullable()
	);

const occurredAtSchema = dateTimeLocalSchema(
	'La fecha y hora son obligatorias.',
	'Ingresa una fecha y hora válidas.'
);

const commonFields = {
	title: z.string().trim().min(1, 'El título es obligatorio.').max(100),
	amount: positiveMoneyAmountSchema('El monto debe ser mayor que cero.'),
	occurredAt: occurredAtSchema
};

const expenseMovementSchema = z.object({
	type: z.literal('expense'),
	...commonFields,
	sourceCardId: z.string().trim().min(1, 'Selecciona la cuenta o tarjeta de origen.'),
	paymentMode: z.enum(movementPaymentModes),
	installmentCount: installmentCountSchema,
	interestFree: z
		.union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal(true), z.literal(false)])
		.optional()
		.transform((value) => value === 'on' || value === 'true' || value === true),
	classificationKind: z.enum(movementClassificationKinds),
	classificationId: z.string().trim().min(1, 'Selecciona un gasto o categoría.')
});

const incomeMovementSchema = z.object({
	type: z.literal('income'),
	...commonFields,
	reason: z.string().trim().min(1, 'La razón del ingreso es obligatoria.').max(160),
	destinationCardId: z.string().trim().min(1, 'Selecciona la cuenta o tarjeta de destino.')
});

const transferMovementSchema = z.object({
	type: z.literal('transfer'),
	...commonFields,
	sourceCardId: z.string().trim().min(1, 'Selecciona la cuenta o tarjeta de origen.'),
	destinationCardId: z.string().trim().min(1, 'Selecciona la cuenta o tarjeta de destino.')
});

export const createMovementSchema = z
	.discriminatedUnion('type', [expenseMovementSchema, incomeMovementSchema, transferMovementSchema])
	.superRefine((data, context) => {
		if (
			data.type === 'expense' &&
			data.paymentMode === 'installments' &&
			data.installmentCount === null
		) {
			context.addIssue({
				code: 'custom',
				path: ['installmentCount'],
				message: 'Indica la cantidad de meses.'
			});
		}
		if (
			data.type === 'transfer' &&
			data.sourceCardId !== '' &&
			data.sourceCardId === data.destinationCardId
		) {
			context.addIssue({
				code: 'custom',
				path: ['destinationCardId'],
				message: 'La cuenta de destino debe ser distinta a la de origen.'
			});
		}
	});
