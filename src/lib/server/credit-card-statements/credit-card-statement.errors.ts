export class CreditCardStatementNotFoundError extends Error {
	constructor(message = 'El corte no existe.') {
		super(message);
		this.name = 'CreditCardStatementNotFoundError';
	}
}

export class CreditCardStatementValidationError extends Error {
	constructor(public readonly errors: Record<string, string[]>) {
		super('El corte no es válido.');
		this.name = 'CreditCardStatementValidationError';
	}
}
