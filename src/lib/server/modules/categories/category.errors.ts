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

export class ParentCategoryNotFoundError extends Error {
	constructor() {
		super('No se encontró la categoría padre.');
		this.name = 'ParentCategoryNotFoundError';
	}
}
