import { z } from 'zod';

export function moneyAmountSchema() {
	return z
		.string()
		.trim()
		.regex(/^\d+(?:\.\d{1,2})?$/, 'Ingresa un monto válido con máximo dos decimales.')
		.transform((amount) => {
			const [units, decimals = ''] = amount.split('.');
			return Number(units) * 100 + Number(decimals.padEnd(2, '0'));
		});
}

export function positiveMoneyAmountSchema(positiveMessage: string) {
	return moneyAmountSchema().pipe(z.number().int().positive(positiveMessage));
}
