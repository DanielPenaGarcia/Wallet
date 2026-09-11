export class ActiveCategoryNotFoundError extends Error {
	constructor() {
		super('La categoría seleccionada no existe o ya no está activa.');
		this.name = 'ActiveCategoryNotFoundError';
	}
}

export class ExpenseNotFoundError extends Error {
	constructor() {
		super('El gasto no existe o ya no está activo.');
		this.name = 'ExpenseNotFoundError';
	}
}
