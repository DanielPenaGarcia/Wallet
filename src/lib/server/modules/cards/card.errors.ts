export class ActiveBankNotFoundError extends Error {
	constructor() {
		super('El banco seleccionado no existe o está inactivo.');
	}
}

export class CardNotFoundError extends Error {
	constructor() {
		super('La cuenta ya no está disponible.');
		this.name = 'CardNotFoundError';
	}
}

export class InvalidCardKindChangeError extends Error {
	constructor() {
		super('El tipo de cuenta no puede cambiarse después de registrarla.');
		this.name = 'InvalidCardKindChangeError';
	}
}

export class CreditInstallmentNotFoundError extends Error {
	constructor() {
		super('La mensualidad seleccionada ya no está disponible.');
		this.name = 'CreditInstallmentNotFoundError';
	}
}

export class CreditInstallmentAlreadyPaidError extends Error {
	constructor() {
		super('La mensualidad seleccionada ya fue marcada como pagada.');
		this.name = 'CreditInstallmentAlreadyPaidError';
	}
}

export class CreditInstallmentNotPaidError extends Error {
	constructor() {
		super('La mensualidad seleccionada no está marcada como pagada.');
		this.name = 'CreditInstallmentNotPaidError';
	}
}

export class CreditInstallmentCannotUnpayError extends Error {
	constructor() {
		super('No puedes desmarcar una mensualidad anterior a otra mensualidad pagada.');
		this.name = 'CreditInstallmentCannotUnpayError';
	}
}
