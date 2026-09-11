import { z } from 'zod';

export function currencyCodeSchema(message = 'La moneda debe tener tres caracteres.') {
	return z
		.string()
		.trim()
		.length(3, message)
		.transform((value) => value.toUpperCase());
}
