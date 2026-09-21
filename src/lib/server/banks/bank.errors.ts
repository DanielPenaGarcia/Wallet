export class BankNameAlreadyExistsError extends Error {
	constructor() {
		super('Ya existe un banco con ese nombre.');
		this.name = 'BankNameAlreadyExistsError';
	}
}

export class BankNotFoundError extends Error {
	constructor() {
		super('No se encontró el banco.');
		this.name = 'BankNotFoundError';
	}
}

export class BankInUseError extends Error {
	constructor() {
		super('No se puede eliminar un banco que está asociado a una cuenta.');
		this.name = 'BankInUseError';
	}
}
