import { fail, type Actions } from '@sveltejs/kit';
import type {
	IncomeFrequency,
	IncomeSource,
	PaymentSchedule,
	WorkDay,
	WorkSchedule
} from '$lib/modules/recurring-incomes/types/recurring-income.types';
import {
	RecurringIncomeNotFoundError,
	RecurringIncomeValidationError
} from '$lib/server/recurring-incomes/recurring-income.errors';
import { recurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';

export async function load() {
	return {
		recurringIncomes: await recurringIncomeService.getRecurringIncomes()
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

export const actions: Actions = {
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
