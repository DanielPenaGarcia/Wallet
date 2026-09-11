export class ParentCategoryNotFoundError extends Error {
	constructor() {
		super('La categoría padre no existe o está inactiva.');
	}
}

export class CategoryNameAlreadyExistsError extends Error {
	constructor() {
		super('Ya existe una categoría con ese nombre dentro del mismo nivel.');
	}
}

export class CategoryNotFoundError extends Error {
	constructor() {
		super('La categoría no existe o ya fue eliminada.');
	}
}

export class CategoryHasActiveChildrenError extends Error {
	constructor() {
		super('No puedes eliminar una categoría que todavía tiene subcategorías activas.');
	}
}
