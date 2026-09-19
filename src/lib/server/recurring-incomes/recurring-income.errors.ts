export class RecurringIncomeNotFoundError extends Error {
	constructor() {
		super('No se encontró el ingreso recurrente.');
		this.name = 'RecurringIncomeNotFoundError';
	}
}

export class RecurringIncomeValidationError extends Error {
	constructor(readonly errors: Record<string, string[]>) {
		super('El ingreso recurrente no cumple las reglas de validación.');
		this.name = 'RecurringIncomeValidationError';
	}
}
