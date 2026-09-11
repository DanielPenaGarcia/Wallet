export class MovementNotFoundError extends Error {
	constructor() {
		super('El movimiento ya no está disponible.');
		this.name = 'MovementNotFoundError';
	}
}

export class ActiveMovementCardNotFoundError extends Error {
	constructor(role: 'source' | 'destination') {
		super(
			role === 'source'
				? 'La cuenta o tarjeta de origen ya no está disponible.'
				: 'La cuenta o tarjeta de destino ya no está disponible.'
		);
		this.name = 'ActiveMovementCardNotFoundError';
	}
}

export class InvalidMovementTransferError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidMovementTransferError';
	}
}

export class InvalidMovementTypeChangeError extends Error {
	constructor() {
		super('El tipo de movimiento no puede cambiarse después de registrarlo.');
		this.name = 'InvalidMovementTypeChangeError';
	}
}

export class InvalidMovementPaymentModeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidMovementPaymentModeError';
	}
}

export class MovementClassificationNotFoundError extends Error {
	constructor(kind: 'expense' | 'category') {
		super(
			kind === 'expense'
				? 'El gasto seleccionado ya no está disponible.'
				: 'La categoría seleccionada ya no está disponible.'
		);
		this.name = 'MovementClassificationNotFoundError';
	}
}
