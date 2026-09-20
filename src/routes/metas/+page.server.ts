import { fail, type Actions } from '@sveltejs/kit';
import type { GoalPriority, GoalStatus, GoalType } from '$lib/modules/goals/types/financial-goal.types';
import {
	FinancialGoalNotFoundError,
	FinancialGoalValidationError
} from '$lib/server/goals/financial-goal.errors';
import { financialGoalService } from '$lib/server/goals/financial-goal.service';
import { financialPlanningService } from '$lib/server/planning/financial-planning.service';
import { recurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';
import { recurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';

export async function load() {
	const [goals, recurringIncomes, recurringExpenses] = await Promise.all([
		financialGoalService.getFinancialGoals(),
		recurringIncomeService.getRecurringIncomes(),
		recurringExpenseService.getRecurringExpenses()
	]);

	return {
		goals,
		planningPeriods: financialPlanningService.projectFreeMoneyPeriods(recurringIncomes, recurringExpenses)
	};
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function goalValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		name: formValue(formData, 'name'),
		targetAmount: formValue(formData, 'targetAmount'),
		currentAmount: formValue(formData, 'currentAmount'),
		distributionPercentage: formValue(formData, 'distributionPercentage'),
		currencyCode: formValue(formData, 'currencyCode'),
		priority: formValue(formData, 'priority') as GoalPriority,
		status: formValue(formData, 'status') as GoalStatus,
		type: formValue(formData, 'type') as GoalType
	};
}

function validateGoalValues(values: ReturnType<typeof goalValues>) {
	const errors: Record<string, string[]> = {};
	const name = values.name.trim();
	const targetAmount = Number(values.targetAmount);
	const currentAmount = Number(values.currentAmount);
	const distributionPercentage = Number(values.distributionPercentage);
	const currencyCode = values.currencyCode.trim().toUpperCase();

	if (name.length === 0) errors.name = ['El nombre de la meta es obligatorio.'];
	if (name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
	if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
		errors.targetAmount = ['El monto objetivo debe ser mayor a 0.'];
	}
	if (!Number.isFinite(currentAmount) || currentAmount < 0) {
		errors.currentAmount = ['El monto acumulado no puede ser negativo.'];
	}
	if (!Number.isInteger(distributionPercentage) || distributionPercentage < 0 || distributionPercentage > 100) {
		errors.distributionPercentage = ['La distribución debe estar entre 0 y 100.'];
	}
	if (values.status === 'active' && distributionPercentage < 1) {
		errors.distributionPercentage = ['Una meta activa debe distribuir al menos 1%.'];
	}
	if (!/^[A-Z]{3}$/.test(currencyCode)) errors.currencyCode = ['La moneda debe tener 3 letras.'];
	if (!['high', 'medium', 'low'].includes(values.priority)) errors.priority = ['La prioridad no es válida.'];
	if (!['active', 'paused', 'completed', 'cancelled'].includes(values.status)) errors.status = ['El estado no es válido.'];
	if (!['purchase', 'emergency_fund', 'travel', 'savings', 'other'].includes(values.type)) {
		errors.type = ['El tipo de meta no es válido.'];
	}

	return {
		errors,
		values: {
			...values,
			currencyCode
		},
		input: {
			name,
			targetAmountCents: Math.round(targetAmount * 100),
			currentAmountCents: Math.round(currentAmount * 100),
			distributionPercentage,
			currencyCode,
			priority: values.priority,
			status: values.status,
			type: values.type
		}
	};
}

export const actions: Actions = {
	createFinancialGoal: async ({ request }) => {
		const values = goalValues(await request.formData());
		const validation = validateGoalValues(values);
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'create-goal' as const,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await financialGoalService.createFinancialGoal(validation.input);
			return { action: 'create-goal' as const, success: 'Meta registrada.' };
		} catch (error) {
			if (error instanceof FinancialGoalValidationError) {
				return fail(400, {
					action: 'create-goal' as const,
					errors: error.errors,
					values: validation.values
				});
			}
			throw error;
		}
	},
	updateFinancialGoal: async ({ request }) => {
		const values = goalValues(await request.formData());
		const validation = validateGoalValues(values);
		if (values.id.trim().length === 0) validation.errors.id = ['La meta es obligatoria.'];
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'update-goal' as const,
				targetId: values.id,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await financialGoalService.updateFinancialGoal({ id: values.id, ...validation.input });
			return { action: 'update-goal' as const, success: 'Meta actualizada.' };
		} catch (error) {
			if (error instanceof FinancialGoalValidationError) {
				return fail(400, {
					action: 'update-goal' as const,
					targetId: values.id,
					errors: error.errors,
					values: validation.values
				});
			}
			if (error instanceof FinancialGoalNotFoundError) {
				return fail(400, {
					action: 'update-goal' as const,
					targetId: values.id,
					message: error.message,
					values: validation.values
				});
			}
			throw error;
		}
	},
	deleteFinancialGoal: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-goal' as const,
				targetId: id,
				message: 'La meta es obligatoria.'
			});
		}

		try {
			await financialGoalService.deleteFinancialGoal(id);
			return { action: 'delete-goal' as const, success: 'Meta eliminada.' };
		} catch (error) {
			if (error instanceof FinancialGoalNotFoundError) {
				return fail(400, {
					action: 'delete-goal' as const,
					targetId: id,
					message: error.message
				});
			}
			throw error;
		}
	}
};
