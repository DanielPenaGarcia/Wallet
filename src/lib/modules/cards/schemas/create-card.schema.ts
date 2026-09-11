import { z } from 'zod';
import { isCardColor, normalizeCardColor } from '$lib/modules/cards/utils/card-color';
import { currencyCodeSchema } from '$lib/shared/schemas/currency-code.schema';
import { moneyAmountSchema } from '$lib/shared/schemas/money-amount.schema';
import type { CardColor } from '../types/card.types';

const moneySchema = moneyAmountSchema();

const commonCardFields = {
	alias: z.string().trim().min(1, 'El alias es obligatorio.').max(60),
	bankId: z.string().trim().min(1, 'Selecciona un banco.'),
	color: z
		.string()
		.trim()
		.refine(isCardColor, 'Ingresa un color hexadecimal o RGB válido.')
		.transform((value) => normalizeCardColor(value) as CardColor),
	lastFourDigits: z.string().trim().regex(/^\d{4}$/, 'Ingresa exactamente cuatro dígitos.'),
	currencyCode: currencyCodeSchema(),
	initialBalance: moneySchema
};

const debitCardSchema = z.object({
	kind: z.literal('debit'),
	...commonCardFields,
	accountId: z.string().trim().min(1, 'La cuenta relacionada es obligatoria.').max(80)
});

const creditCardSchema = z.object({
	kind: z.literal('credit'),
	...commonCardFields,
	maximumOfferedCredit: moneySchema,
	statementDay: z.coerce.number().int().min(1).max(31),
	paymentDueDay: z.coerce.number().int().min(1).max(31)
});

export const createCardSchema = z.discriminatedUnion('kind', [debitCardSchema, creditCardSchema]);

export type CreateCardData = z.infer<typeof createCardSchema>;
