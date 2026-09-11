import { fail } from '@sveltejs/kit';
import { createExpenseSchema } from '$lib/modules/expenses/schemas/create-expense.schema';
import { deleteExpenseSchema } from '$lib/modules/expenses/schemas/delete-expense.schema';
import { payExpenseSchema } from '$lib/modules/expenses/schemas/pay-expense.schema';
import { updateExpenseSchema } from '$lib/modules/expenses/schemas/update-expense.schema';
import { createFinancialGoalSchema } from '$lib/modules/goals/schemas/create-financial-goal.schema';
import { deleteFinancialGoalSchema } from '$lib/modules/goals/schemas/delete-financial-goal.schema';
import { updateFinancialGoalSchema } from '$lib/modules/goals/schemas/update-financial-goal.schema';
import { formStringValue } from '$lib/shared/utils/form-data';
import type {
	ExpenseAmountKind,
	ExpenseClassification,
	ExpenseFrequency,
	ExpenseIntervalUnit
} from '$lib/modules/expenses/types/expense.types';
import {
	expenseAmountKinds,
	expenseClassifications,
	expenseFrequencies,
	expenseIntervalUnits
} from '$lib/modules/expenses/types/expense.types';
import { createJobIncomeSchema } from '$lib/modules/incomes/schemas/create-job-income.schema';
import { deleteJobIncomeSchema } from '$lib/modules/incomes/schemas/delete-job-income.schema';
import { updateJobIncomeSchema } from '$lib/modules/incomes/schemas/update-job-income.schema';
import { getCategoryOptions } from '$lib/server/modules/categories/category.service';
import { getCards } from '$lib/server/modules/cards/card.service';
import { ActiveCategoryNotFoundError, ExpenseNotFoundError } from '$lib/server/modules/expenses/expense.errors';
import { createExpense, deleteExpense, getExpenses, payExpense, updateExpense } from '$lib/server/modules/expenses/expense.service';
import {
	FinancialGoalNotFoundError,
	GoalAllocationExceededError
} from '$lib/server/modules/goals/financial-goal.errors';
import {
	createFinancialGoal,
	deleteFinancialGoal,
	getFinancialGoals,
	updateFinancialGoal
} from '$lib/server/modules/goals/financial-goal.service';
import { JobIncomeNotFoundError } from '$lib/server/modules/incomes/income.errors';
import {
	createJobIncome,
	deleteJobIncome,
	getJobIncomes,
	updateJobIncome
} from '$lib/server/modules/incomes/income.service';
import {
	ActiveMovementCardNotFoundError,
	InvalidMovementPaymentModeError
} from '$lib/server/modules/movements/movement.errors';

function formValues(entries: Record<string, FormDataEntryValue>): {
	jobName: string;
	monthlyAmount: string;
	amountType: 'gross' | 'net';
	paymentFrequency: 'weekly' | 'semimonthly' | 'monthly';
	hasSchedule: boolean;
	schedule: string;
	currencyCode: string;
} {
	const amountType = entries.amountType === 'gross' ? 'gross' : 'net';
	const paymentFrequency =
		entries.paymentFrequency === 'weekly' || entries.paymentFrequency === 'monthly'
			? entries.paymentFrequency
			: 'semimonthly';
	return {
		jobName: formStringValue(entries.jobName),
		monthlyAmount: formStringValue(entries.monthlyAmount),
		amountType,
		paymentFrequency,
		hasSchedule: entries.hasSchedule === 'on',
		schedule: formStringValue(entries.schedule),
		currencyCode: formStringValue(entries.currencyCode)
	};
}

function expenseFormValues(entries: Record<string, FormDataEntryValue>): {
	name: string;
	classification: ExpenseClassification;
	frequency: ExpenseFrequency;
	customIntervalCount: string;
	customIntervalUnit: ExpenseIntervalUnit | '';
	amountKind: ExpenseAmountKind;
	amount: string;
	currencyCode: string;
	categoryId: string;
	statementDay: string;
	paymentDueDay: string;
} {
	const classification =
		expenseClassifications.find((option) => option === entries.classification) ?? 'necessity';
	const frequency =
		expenseFrequencies.find((option) => option === entries.frequency) ?? 'monthly';
	const amountKind = expenseAmountKinds.find((option) => option === entries.amountKind) ?? 'fixed';
	const customIntervalUnit =
		expenseIntervalUnits.find((option) => option === entries.customIntervalUnit) ?? '';

	return {
		name: formStringValue(entries.name),
		classification,
		frequency,
		customIntervalCount: formStringValue(entries.customIntervalCount),
		customIntervalUnit,
		amountKind,
		amount: formStringValue(entries.amount),
		currencyCode: formStringValue(entries.currencyCode),
		categoryId: formStringValue(entries.categoryId),
		statementDay: formStringValue(entries.statementDay),
		paymentDueDay: formStringValue(entries.paymentDueDay)
	};
}

function payExpenseFormValues(entries: Record<string, FormDataEntryValue>) {
	return {
		expenseId: formStringValue(entries.expenseId),
		mode: entries.mode === 'card' ? 'card' : ('paid' as const),
		amount: formStringValue(entries.amount),
		paidAt: formStringValue(entries.paidAt),
		note: formStringValue(entries.note),
		cardId: formStringValue(entries.cardId)
	};
}

function goalFormValues(entries: Record<string, FormDataEntryValue>) {
	return {
		name: formStringValue(entries.name),
		targetAmount: formStringValue(entries.targetAmount),
		allocationPercentage: formStringValue(entries.allocationPercentage),
		currencyCode: formStringValue(entries.currencyCode)
	};
}

export async function load() {
	const [incomes, expenses, categories, cards, goals] = await Promise.all([
		getJobIncomes(),
		getExpenses(),
		getCategoryOptions(),
		getCards(),
		getFinancialGoals()
	]);
	return { incomes, expenses, categories, cards, goals };
}

export const actions = {
	createFinancialGoal: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createFinancialGoalSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-goal' as const,
				errors: result.error.flatten().fieldErrors,
				values: goalFormValues(entries)
			});
		}

		try {
			await createFinancialGoal(result.data);
			return { action: 'create-goal' as const, success: 'Objetivo registrado correctamente.' };
		} catch (error) {
			if (error instanceof GoalAllocationExceededError) {
				return fail(400, {
					action: 'create-goal' as const,
					message: error.message,
					values: goalFormValues(entries)
				});
			}
			throw error;
		}
	},
	updateFinancialGoal: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateFinancialGoalSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-goal' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: goalFormValues(entries)
			});
		}

		try {
			await updateFinancialGoal(result.data);
			return { action: 'update-goal' as const, success: 'Objetivo actualizado correctamente.' };
		} catch (error) {
			if (error instanceof FinancialGoalNotFoundError || error instanceof GoalAllocationExceededError) {
				return fail(400, {
					action: 'update-goal' as const,
					targetId,
					message: error.message,
					values: goalFormValues(entries)
				});
			}
			throw error;
		}
	},
	deleteFinancialGoal: async ({ request }) => {
		const result = deleteFinancialGoalSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, { action: 'delete-goal' as const, message: 'Objetivo inválido.' });
		}

		try {
			await deleteFinancialGoal(result.data.id);
			return { action: 'delete-goal' as const, success: 'Objetivo eliminado correctamente.' };
		} catch (error) {
			if (error instanceof FinancialGoalNotFoundError) {
				return fail(400, {
					action: 'delete-goal' as const,
					targetId: result.data.id,
					message: error.message
				});
			}
			throw error;
		}
	},
	createExpense: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createExpenseSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-expense' as const,
				errors: result.error.flatten().fieldErrors,
				values: expenseFormValues(entries)
			});
		}

		try {
			await createExpense(result.data);
			return { action: 'create-expense' as const, success: 'Gasto registrado correctamente.' };
		} catch (error) {
			if (error instanceof ActiveCategoryNotFoundError) {
				return fail(400, {
					action: 'create-expense' as const,
					message: error.message,
					values: expenseFormValues(entries)
				});
			}
			throw error;
		}
	},
	updateExpense: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateExpenseSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-expense' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: expenseFormValues(entries)
			});
		}

		try {
			await updateExpense(result.data);
			return { action: 'update-expense' as const, success: 'Gasto actualizado correctamente.' };
		} catch (error) {
			if (error instanceof ActiveCategoryNotFoundError || error instanceof ExpenseNotFoundError) {
				return fail(400, {
					action: 'update-expense' as const,
					targetId,
					message: error.message,
					values: expenseFormValues(entries)
				});
			}
			throw error;
		}
	},
	deleteExpense: async ({ request }) => {
		const result = deleteExpenseSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, { action: 'delete-expense' as const, message: 'Gasto inválido.' });
		}

		try {
			await deleteExpense(result.data.id);
			return { action: 'delete-expense' as const, success: 'Gasto eliminado correctamente.' };
		} catch (error) {
			if (error instanceof ExpenseNotFoundError) {
				return fail(400, {
					action: 'delete-expense' as const,
					targetId: result.data.id,
					message: error.message
				});
			}
			throw error;
		}
	},
	payExpense: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = payExpenseSchema.safeParse(entries);
		const targetId = formStringValue(entries.expenseId);
		if (!result.success) {
			return fail(400, {
				action: 'pay-expense' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: payExpenseFormValues(entries)
			});
		}

		try {
			await payExpense(result.data);
			return { action: 'pay-expense' as const, success: 'Pago registrado correctamente.' };
		} catch (error) {
			if (
				error instanceof ExpenseNotFoundError ||
				error instanceof ActiveMovementCardNotFoundError ||
				error instanceof InvalidMovementPaymentModeError
			) {
				return fail(400, {
					action: 'pay-expense' as const,
					targetId: result.data.expenseId,
					message: error.message,
					values: payExpenseFormValues(entries)
				});
			}
			throw error;
		}
	},
	createJobIncome: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createJobIncomeSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-income' as const,
				errors: result.error.flatten().fieldErrors,
				values: formValues(entries)
			});
		}

		await createJobIncome(result.data);
		return { action: 'create-income' as const, success: 'Ingreso recurrente registrado correctamente.' };
	},
	updateJobIncome: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateJobIncomeSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-income' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: formValues(entries)
			});
		}

		try {
			await updateJobIncome(result.data);
			return { action: 'update-income' as const, success: 'Ingreso actualizado correctamente.' };
		} catch (error) {
			if (error instanceof JobIncomeNotFoundError) {
				return fail(400, { action: 'update-income' as const, targetId, message: error.message });
			}
			throw error;
		}
	},
	deleteJobIncome: async ({ request }) => {
		const result = deleteJobIncomeSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) return fail(400, { action: 'delete-income' as const, message: 'Ingreso inválido.' });

		try {
			await deleteJobIncome(result.data.id);
			return { action: 'delete-income' as const, success: 'Ingreso eliminado correctamente.' };
		} catch (error) {
			if (error instanceof JobIncomeNotFoundError) {
				return fail(400, { action: 'delete-income' as const, targetId: result.data.id, message: error.message });
			}
			throw error;
		}
	}
};
