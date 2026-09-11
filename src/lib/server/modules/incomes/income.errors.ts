export class JobIncomeNotFoundError extends Error {
	constructor() {
		super('El ingreso no existe o ya fue eliminado.');
	}
}
