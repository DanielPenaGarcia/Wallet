export class AccountNotFoundError extends Error {
	constructor() {
		super('No se encontró la cuenta.');
		this.name = 'AccountNotFoundError';
	}
}

export class AccountValidationError extends Error {
	constructor(readonly errors: Record<string, string[]>) {
		super('La cuenta no cumple las reglas de validación.');
		this.name = 'AccountValidationError';
	}
}

export class PersonalAccountDeleteError extends Error {
	constructor() {
		super('La cuenta de efectivo no puede eliminarse.');
		this.name = 'PersonalAccountDeleteError';
	}
}
