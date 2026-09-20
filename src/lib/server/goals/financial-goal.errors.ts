export class FinancialGoalNotFoundError extends Error {
	constructor() {
		super('No se encontró la meta.');
		this.name = 'FinancialGoalNotFoundError';
	}
}

export class FinancialGoalValidationError extends Error {
	constructor(readonly errors: Record<string, string[]>) {
		super('La meta no cumple las reglas de validación.');
		this.name = 'FinancialGoalValidationError';
	}
}
