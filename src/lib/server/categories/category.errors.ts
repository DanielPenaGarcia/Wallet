export class CategoryNameAlreadyExistsError extends Error {
	constructor() {
		super('Ya existe una categoría con ese nombre en el mismo nivel.');
		this.name = 'CategoryNameAlreadyExistsError';
	}
}

export class CategoryNotFoundError extends Error {
	constructor() {
		super('No se encontró la categoría.');
		this.name = 'CategoryNotFoundError';
	}
}

export class CategoryInUseError extends Error {
	constructor() {
		super('No se puede eliminar una categoría que tiene subcategorías o gastos recurrentes asociados.');
		this.name = 'CategoryInUseError';
	}
}

export class ParentCategoryNotFoundError extends Error {
	constructor() {
		super('No se encontró la categoría padre.');
		this.name = 'ParentCategoryNotFoundError';
	}
}
