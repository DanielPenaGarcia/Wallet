export class MovementNotFoundError extends Error {
	constructor() {
		super('No se encontró el movimiento.');
		this.name = 'MovementNotFoundError';
	}
}

export class MovementValidationError extends Error {
	constructor(readonly errors: Record<string, string[]>) {
		super('El movimiento no cumple las reglas de validación.');
		this.name = 'MovementValidationError';
	}
}
