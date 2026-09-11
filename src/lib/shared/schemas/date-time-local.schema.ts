import { z } from 'zod';

export function dateTimeLocalSchema(requiredMessage: string, invalidMessage: string) {
	return z
		.string()
		.trim()
		.min(1, requiredMessage)
		.refine((value) => !Number.isNaN(new Date(value).getTime()), invalidMessage)
		.transform((value) => new Date(value).toISOString());
}
