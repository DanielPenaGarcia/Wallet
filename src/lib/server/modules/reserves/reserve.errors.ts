export class ReserveNotFoundError extends Error {
	constructor() {
		super('No se encontró el apartado seleccionado.');
	}
}

export class InvalidReserveSourceError extends Error {
	constructor(message = 'Selecciona una cuenta de débito como fuente.') {
		super(message);
	}
}

export class InsufficientReserveSourceBalanceError extends Error {
	constructor() {
		super('La cuenta de origen no tiene saldo suficiente para este apartado.');
	}
}

export class InvalidReserveAmountError extends Error {
	constructor() {
		super('El apartado seleccionado no tiene un monto pendiente.');
	}
}
