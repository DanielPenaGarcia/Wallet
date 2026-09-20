export class RecurringExpenseNotFoundError extends Error {
	constructor() {
		super('No se encontró el gasto recurrente.');
		this.name = 'RecurringExpenseNotFoundError';
	}
}

export class RecurringExpenseValidationError extends Error {
	constructor(readonly errors: Record<string, string[]>) {
		super('El gasto recurrente no cumple las reglas de validación.');
		this.name = 'RecurringExpenseValidationError';
	}
}
