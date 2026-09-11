export class BankNameAlreadyExistsError extends Error {
	constructor() {
		super('Ya existe un banco con ese nombre.');
	}
}

export class BankNotFoundError extends Error {
	constructor() {
		super('El banco ya no está disponible.');
		this.name = 'BankNotFoundError';
	}
}

export class BankHasCardsError extends Error {
	constructor() {
		super('No puedes eliminar el banco porque está relacionado con una o más tarjetas.');
		this.name = 'BankHasCardsError';
	}
}
