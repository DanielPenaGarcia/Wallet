export class FinancialGoalNotFoundError extends Error {
	constructor() {
		super('El objetivo ya no está disponible.');
		this.name = 'FinancialGoalNotFoundError';
	}
}

export class GoalAllocationExceededError extends Error {
	constructor(availablePercentage: number) {
		super(
			availablePercentage === 0
				? 'Ya está asignado el 100% de los ingresos entre los objetivos activos.'
				: `El porcentaje supera lo disponible. Puedes asignar hasta ${availablePercentage}%.`
		);
		this.name = 'GoalAllocationExceededError';
	}
}
