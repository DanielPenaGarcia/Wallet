import {
	goalPriorities,
	goalStatuses,
	goalTypes
} from '$lib/modules/goals/types/financial-goal.types';
import { availableGoalDistribution } from '$lib/modules/goals/utils/goal-distribution';
import { normalizeName } from '$lib/shared/utils/normalize-name';
import { drizzleFinancialGoalRepository } from './drizzle-financial-goal.repository';
import {
	FinancialGoalNotFoundError,
	FinancialGoalValidationError
} from './financial-goal.errors';
import type { FinancialGoalRepository } from './financial-goal.repository';
import type { CreateFinancialGoalInput } from './inputs/create-financial-goal.input';
import type { UpdateFinancialGoalInput } from './inputs/update-financial-goal.input';

export class FinancialGoalService {
	constructor(private readonly financialGoalRepository: FinancialGoalRepository) {}

	getFinancialGoals() {
		return this.financialGoalRepository.list();
	}

	async createFinancialGoal(input: CreateFinancialGoalInput): Promise<void> {
		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		await this.assertDistributionAvailable(normalizedInput);
		await this.assertUniqueGoalName(normalizedInput.name);
		await this.financialGoalRepository.create(normalizedInput);
	}

	async updateFinancialGoal(input: UpdateFinancialGoalInput): Promise<void> {
		if (!(await this.financialGoalRepository.findById(input.id))) {
			throw new FinancialGoalNotFoundError();
		}

		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		await this.assertDistributionAvailable(normalizedInput, input.id);
		await this.assertUniqueGoalName(normalizedInput.name, input.id);
		await this.financialGoalRepository.update(normalizedInput);
	}

	async deleteFinancialGoal(id: string): Promise<void> {
		if (!(await this.financialGoalRepository.findById(id))) {
			throw new FinancialGoalNotFoundError();
		}

		await this.financialGoalRepository.delete(id);
	}

	private normalizeInput<T extends CreateFinancialGoalInput>(input: T): T {
		return {
			...input,
			name: input.name.trim(),
			currencyCode: input.currencyCode.trim().toUpperCase()
		};
	}

	private async assertValidInput(input: CreateFinancialGoalInput) {
		const errors: Record<string, string[]> = {};

		if (input.name.length === 0) errors.name = ['El nombre de la meta es obligatorio.'];
		if (input.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (!Number.isInteger(input.targetAmountCents) || input.targetAmountCents <= 0) {
			errors.targetAmount = ['El monto objetivo debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.currentAmountCents) || input.currentAmountCents < 0) {
			errors.currentAmount = ['El monto acumulado no puede ser negativo.'];
		}
		if (!Number.isInteger(input.distributionPercentage) || input.distributionPercentage < 0 || input.distributionPercentage > 100) {
			errors.distributionPercentage = ['La distribución debe estar entre 0 y 100.'];
		}
		if (input.status === 'active' && input.distributionPercentage < 1) {
			errors.distributionPercentage = ['Una meta activa debe distribuir al menos 1%.'];
		}
		if (!/^[A-Z]{3}$/.test(input.currencyCode)) {
			errors.currencyCode = ['La moneda debe tener 3 letras.'];
		}
		if (!goalPriorities.includes(input.priority)) errors.priority = ['La prioridad no es válida.'];
		if (!goalStatuses.includes(input.status)) errors.status = ['El estado no es válido.'];
		if (!goalTypes.includes(input.type)) errors.type = ['El tipo de meta no es válido.'];

		if (Object.keys(errors).length > 0) throw new FinancialGoalValidationError(errors);
	}

	private async assertDistributionAvailable(input: CreateFinancialGoalInput, ignoredId?: string) {
		if (input.status !== 'active') return;

		const goals = await this.financialGoalRepository.list();
		const availablePercentage = availableGoalDistribution(goals, ignoredId);
		const distributedPercentage = 100 - availablePercentage;

		if (input.distributionPercentage > availablePercentage) {
			throw new FinancialGoalValidationError({
				distributionPercentage: [
					`No puedes asignar ${input.distributionPercentage}%. Actualmente tienes ${distributedPercentage}% distribuido y solo queda ${availablePercentage}% disponible.`
				]
			});
		}
	}

	private async assertUniqueGoalName(name: string, ignoredId?: string) {
		const normalizedName = normalizeName(name);
		const duplicated = (await this.financialGoalRepository.list()).some(
			(goal) => goal.id !== ignoredId && normalizeName(goal.name) === normalizedName
		);
		if (duplicated) throw new FinancialGoalValidationError({ name: ['Ya existe una meta con ese nombre.'] });
	}

}

export const financialGoalService = new FinancialGoalService(drizzleFinancialGoalRepository);
