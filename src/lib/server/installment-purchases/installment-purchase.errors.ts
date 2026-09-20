export class InstallmentPurchaseNotFoundError extends Error {
	constructor(message = 'La compra MSI no existe.') {
		super(message);
		this.name = 'InstallmentPurchaseNotFoundError';
	}
}

export class InstallmentPurchaseValidationError extends Error {
	constructor(public readonly errors: Record<string, string[]>) {
		super('La compra MSI no es válida.');
		this.name = 'InstallmentPurchaseValidationError';
	}
}
