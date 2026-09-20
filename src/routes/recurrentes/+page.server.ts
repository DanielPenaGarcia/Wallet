import { fail, type Actions } from '@sveltejs/kit';
import type {
	IncomeFrequency,
	IncomeSource,
	PaymentSchedule,
	WorkDay,
	WorkSchedule
} from '$lib/modules/recurring-incomes/types/recurring-income.types';
import type { ExpenseAmountKind, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
import type {
	RecurringExpenseFrequency,
	RecurringExpensePaymentSchedule,
	WeekDay
} from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import { categoryService } from '$lib/server/categories/category.service';
import {
	RecurringIncomeNotFoundError,
	RecurringIncomeValidationError
} from '$lib/server/recurring-incomes/recurring-income.errors';
import { recurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';
import {
	RecurringExpenseNotFoundError,
	RecurringExpenseValidationError
} from '$lib/server/recurring-expenses/recurring-expense.errors';
import { recurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';

export async function load() {
	return {
		recurringExpenses: await recurringExpenseService.getRecurringExpenses(),
		recurringIncomes: await recurringIncomeService.getRecurringIncomes(),
		categories: await categoryService.getCategories()
	};
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function formBoolean(formData: FormData, field: string) {
	return formData.get(field) === 'on' || formData.get(field) === 'true';
}

function recurringIncomeValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		title: formValue(formData, 'title'),
		expectedAmount: formValue(formData, 'expectedAmount'),
		source: formValue(formData, 'source') as IncomeSource,
		frequency: formValue(formData, 'frequency') as IncomeFrequency,
		weeklyDay: formValue(formData, 'weeklyDay'),
		semimonthlyFirstDay: formValue(formData, 'semimonthlyFirstDay'),
		semimonthlySecondDay: formValue(formData, 'semimonthlySecondDay'),
		monthlyDay: formValue(formData, 'monthlyDay'),
		workSchedule: formValue(formData, 'workSchedule'),
		isActive: formBoolean(formData, 'isActive')
	};
}

function recurringExpenseValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		name: formValue(formData, 'name'),
		categoryId: formValue(formData, 'categoryId'),
		amount: formValue(formData, 'amount'),
		amountKind: formValue(formData, 'amountKind') as ExpenseAmountKind,
		frequency: formValue(formData, 'frequency') as RecurringExpenseFrequency,
		customIntervalCount: formValue(formData, 'customIntervalCount'),
		customIntervalUnit: formValue(formData, 'customIntervalUnit') as ExpenseIntervalUnit | '',
		weeklyDay: formValue(formData, 'weeklyDay'),
		semimonthlyFirstDay: formValue(formData, 'semimonthlyFirstDay'),
		semimonthlySecondDay: formValue(formData, 'semimonthlySecondDay'),
		monthlyDay: formValue(formData, 'monthlyDay'),
		yearlyMonth: formValue(formData, 'yearlyMonth'),
		yearlyDay: formValue(formData, 'yearlyDay'),
		statementDay: formValue(formData, 'statementDay'),
		lastPaidAt: formValue(formData, 'lastPaidAt'),
		isActive: formBoolean(formData, 'isActive')
	};
}

function validateRecurringIncomeValues(values: ReturnType<typeof recurringIncomeValues>) {
	const errors: Record<string, string[]> = {};
	const title = values.title.trim();
	const expectedAmount = Number(values.expectedAmount);
	const expectedAmountCents = Math.round(expectedAmount * 100);
	const paymentSchedule = buildPaymentSchedule(values, errors);
	const parsedWorkSchedule = parseWorkSchedule(values.workSchedule, errors);

	if (title.length === 0) errors.title = ['El nombre es obligatorio.'];
	if (title.length > 100) errors.title = ['El nombre debe tener máximo 100 caracteres.'];
	if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
		errors.expectedAmount = ['El monto esperado debe ser mayor a 0.'];
	}
	if (!['work', 'business', 'support', 'rent', 'other'].includes(values.source)) {
		errors.source = ['La fuente del ingreso no es válida.'];
	}
	if (!['daily', 'weekly', 'semimonthly', 'monthly'].includes(values.frequency)) {
		errors.frequency = ['La frecuencia no es válida.'];
	}

	return {
		errors,
		values: {
			...values,
			parsedWorkSchedule
		},
		input: {
			title,
			expectedAmountCents,
			source: values.source,
			frequency: values.frequency,
			paymentSchedule,
			workSchedule: values.source === 'work' ? parsedWorkSchedule : null,
			isActive: values.isActive
		}
	};
}

function validateRecurringExpenseValues(values: ReturnType<typeof recurringExpenseValues>) {
	const errors: Record<string, string[]> = {};
	const name = values.name.trim();
	const amount = Number(values.amount);
	const amountCents = Math.round(amount * 100);
	const customIntervalCount = values.frequency === 'custom' ? Number(values.customIntervalCount) : null;
	const customIntervalUnit = values.frequency === 'custom' ? values.customIntervalUnit || null : null;
	const statementDay = values.statementDay.trim() ? Number(values.statementDay) : null;
	const paymentSchedule = buildRecurringExpensePaymentSchedule(values, errors);

	if (name.length === 0) errors.name = ['El nombre del gasto es obligatorio.'];
	if (name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
	if (!Number.isFinite(amount) || amount <= 0) errors.amount = ['El monto debe ser mayor a 0.'];
	if (!['fixed', 'estimated'].includes(values.amountKind)) errors.amountKind = ['El tipo de monto no es válido.'];
	if (!['daily', 'weekly', 'semimonthly', 'monthly', 'yearly', 'custom'].includes(values.frequency)) {
		errors.frequency = ['La frecuencia no es válida.'];
	}
	if (values.categoryId.trim().length === 0) errors.categoryId = ['Selecciona una categoría.'];
	if (values.frequency === 'custom') {
		if (!Number.isInteger(customIntervalCount) || !customIntervalCount || customIntervalCount < 1) {
			errors.customIntervalCount = ['El intervalo personalizado debe ser mayor a 0.'];
		}
		if (!customIntervalUnit || !['days', 'weeks', 'months', 'years'].includes(customIntervalUnit)) {
			errors.customIntervalUnit = ['Selecciona el periodo del intervalo.'];
		}
	}
	if (statementDay !== null && (!Number.isInteger(statementDay) || statementDay < 1 || statementDay > 31)) {
		errors.statementDay = ['El día de corte debe estar entre 1 y 31.'];
	}

	return {
		errors,
		values: {
			...values,
			parsedPaymentSchedule: paymentSchedule
		},
		input: {
			name,
			categoryId: values.categoryId,
			amountCents,
			amountKind: values.amountKind,
			frequency: values.frequency,
			customIntervalCount,
			customIntervalUnit,
			paymentSchedule,
			statementDay,
			lastPaidAt: values.lastPaidAt.trim() || null,
			isActive: values.isActive
		}
	};
}

function buildPaymentSchedule(
	values: ReturnType<typeof recurringIncomeValues>,
	errors: Record<string, string[]>
): PaymentSchedule {
	if (values.frequency === 'daily') return { type: 'daily' };

	if (values.frequency === 'weekly') {
		if (!isWorkDay(values.weeklyDay)) errors.paymentSchedule = ['Selecciona un día de pago semanal.'];
		return { type: 'weekly', weekday: isWorkDay(values.weeklyDay) ? values.weeklyDay : 'friday' };
	}

	if (values.frequency === 'monthly') {
		const day = parseMonthDay(values.monthlyDay);
		if (!day) errors.paymentSchedule = ['Selecciona un día de pago mensual válido.'];
		return { type: 'monthly', day: day ?? 30 };
	}

	const firstDay = Number(values.semimonthlyFirstDay);
	const secondDay = parseMonthDay(values.semimonthlySecondDay);
	if (!Number.isInteger(firstDay) || firstDay < 1 || firstDay > 31 || !secondDay) {
		errors.paymentSchedule = ['Configura los días de pago quincenal.'];
	}

	return {
		type: 'semimonthly',
		firstDay: Number.isInteger(firstDay) ? firstDay : 15,
		secondDay: secondDay ?? 'last'
	};
}

function buildRecurringExpensePaymentSchedule(
	values: ReturnType<typeof recurringExpenseValues>,
	errors: Record<string, string[]>
): RecurringExpensePaymentSchedule {
	if (values.frequency === 'daily') return { type: 'daily' };

	if (values.frequency === 'weekly') {
		if (!isWeekDay(values.weeklyDay)) errors.paymentSchedule = ['Selecciona un día de pago semanal.'];
		return { type: 'weekly', weekday: isWeekDay(values.weeklyDay) ? values.weeklyDay : 'monday' };
	}

	if (values.frequency === 'semimonthly') {
		const firstDay = Number(values.semimonthlyFirstDay);
		const secondDay = parseMonthDay(values.semimonthlySecondDay);
		if (!Number.isInteger(firstDay) || firstDay < 1 || firstDay > 31 || !secondDay) {
			errors.paymentSchedule = ['Configura los días de pago quincenal.'];
		}
		return {
			type: 'semimonthly',
			firstDay: Number.isInteger(firstDay) ? firstDay : 15,
			secondDay: secondDay ?? 'last'
		};
	}

	if (values.frequency === 'monthly') {
		const day = parseMonthDay(values.monthlyDay);
		if (!day) errors.paymentSchedule = ['Selecciona un día de pago mensual válido.'];
		return { type: 'monthly', day: day ?? 1 };
	}

	if (values.frequency === 'yearly') {
		const month = Number(values.yearlyMonth);
		const day = parseMonthDay(values.yearlyDay);
		if (!Number.isInteger(month) || month < 1 || month > 12 || !day) {
			errors.paymentSchedule = ['Configura una fecha anual válida.'];
		}
		return {
			type: 'yearly',
			month: Number.isInteger(month) ? month : 1,
			day: day ?? 1
		};
	}

	return { type: 'custom' };
}

function parseWorkSchedule(value: string, errors: Record<string, string[]>): WorkSchedule | null {
	if (!value.trim()) return null;

	try {
		const parsed = JSON.parse(value) as WorkSchedule;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			errors.workSchedule = ['El horario no tiene un formato válido.'];
			return null;
		}

		return parsed;
	} catch {
		errors.workSchedule = ['El horario no tiene un formato válido.'];
		return null;
	}
}

function parseMonthDay(value: string): number | 'last' | null {
	if (value === 'last') return 'last';
	const day = Number(value);
	return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

function isWorkDay(value: string): value is WorkDay {
	return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(value);
}

function isWeekDay(value: string): value is WeekDay {
	return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(value);
}

export const actions: Actions = {
	createRecurringExpense: async ({ request }) => {
		const values = recurringExpenseValues(await request.formData());
		const validation = validateRecurringExpenseValues(values);
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'create-recurring-expense' as const,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await recurringExpenseService.createRecurringExpense(validation.input);
			return { action: 'create-recurring-expense' as const, success: 'Gasto recurrente registrado.' };
		} catch (error) {
			if (error instanceof RecurringExpenseValidationError) {
				return fail(400, {
					action: 'create-recurring-expense' as const,
					errors: error.errors,
					values: validation.values
				});
			}
			throw error;
		}
	},
	updateRecurringExpense: async ({ request }) => {
		const values = recurringExpenseValues(await request.formData());
		const validation = validateRecurringExpenseValues(values);
		if (values.id.trim().length === 0) validation.errors.id = ['El gasto recurrente es obligatorio.'];
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'update-recurring-expense' as const,
				targetId: values.id,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await recurringExpenseService.updateRecurringExpense({ id: values.id, ...validation.input });
			return { action: 'update-recurring-expense' as const, success: 'Gasto recurrente actualizado.' };
		} catch (error) {
			if (error instanceof RecurringExpenseValidationError) {
				return fail(400, {
					action: 'update-recurring-expense' as const,
					targetId: values.id,
					errors: error.errors,
					values: validation.values
				});
			}
			if (error instanceof RecurringExpenseNotFoundError) {
				return fail(400, {
					action: 'update-recurring-expense' as const,
					targetId: values.id,
					message: error.message,
					values: validation.values
				});
			}
			throw error;
		}
	},
	deleteRecurringExpense: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-recurring-expense' as const,
				targetId: id,
				message: 'El gasto recurrente es obligatorio.'
			});
		}

		try {
			await recurringExpenseService.deleteRecurringExpense(id);
			return { action: 'delete-recurring-expense' as const, success: 'Gasto recurrente eliminado.' };
		} catch (error) {
			if (error instanceof RecurringExpenseNotFoundError) {
				return fail(400, {
					action: 'delete-recurring-expense' as const,
					targetId: id,
					message: error.message
				});
			}
			throw error;
		}
	},
	createRecurringIncome: async ({ request }) => {
		const values = recurringIncomeValues(await request.formData());
		const validation = validateRecurringIncomeValues(values);
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'create-recurring-income' as const,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await recurringIncomeService.createRecurringIncome(validation.input);
			return { action: 'create-recurring-income' as const, success: 'Ingreso recurrente registrado.' };
		} catch (error) {
			if (error instanceof RecurringIncomeValidationError) {
				return fail(400, {
					action: 'create-recurring-income' as const,
					errors: error.errors,
					values: validation.values
				});
			}
			throw error;
		}
	},
	updateRecurringIncome: async ({ request }) => {
		const values = recurringIncomeValues(await request.formData());
		const validation = validateRecurringIncomeValues(values);
		if (values.id.trim().length === 0) validation.errors.id = ['El ingreso recurrente es obligatorio.'];
		if (Object.keys(validation.errors).length > 0) {
			return fail(400, {
				action: 'update-recurring-income' as const,
				targetId: values.id,
				errors: validation.errors,
				values: validation.values
			});
		}

		try {
			await recurringIncomeService.updateRecurringIncome({ id: values.id, ...validation.input });
			return { action: 'update-recurring-income' as const, success: 'Ingreso recurrente actualizado.' };
		} catch (error) {
			if (error instanceof RecurringIncomeValidationError) {
				return fail(400, {
					action: 'update-recurring-income' as const,
					targetId: values.id,
					errors: error.errors,
					values: validation.values
				});
			}
			if (error instanceof RecurringIncomeNotFoundError) {
				return fail(400, {
					action: 'update-recurring-income' as const,
					targetId: values.id,
					message: error.message,
					values: validation.values
				});
			}
			throw error;
		}
	},
	deleteRecurringIncome: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-recurring-income' as const,
				targetId: id,
				message: 'El ingreso recurrente es obligatorio.'
			});
		}

		try {
			await recurringIncomeService.deleteRecurringIncome(id);
			return { action: 'delete-recurring-income' as const, success: 'Ingreso recurrente eliminado.' };
		} catch (error) {
			if (error instanceof RecurringIncomeNotFoundError) {
				return fail(400, {
					action: 'delete-recurring-income' as const,
					targetId: id,
					message: error.message
				});
			}
			throw error;
		}
	}
};
