export class LoanNotFoundError extends Error {
	constructor(message = 'El préstamo no existe.') {
		super(message);
		this.name = 'LoanNotFoundError';
	}
}

export class LoanValidationError extends Error {
	constructor(public readonly errors: Record<string, string[]>) {
		super('Revisa los datos del préstamo.');
		this.name = 'LoanValidationError';
	}
}
