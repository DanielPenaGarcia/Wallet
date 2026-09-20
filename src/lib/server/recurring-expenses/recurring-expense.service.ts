import {
	expenseAmountKinds,
	expenseIntervalUnits
} from '$lib/modules/expenses/types/expense.types';
import {
	recurringExpenseFrequencies,
	weekDays,
	type MonthDay,
	type RecurringExpensePaymentSchedule
} from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import { drizzleCategoryRepository } from '$lib/server/categories/drizzle-category.repository';
import type { CategoryRepository } from '$lib/server/categories/category.repository';
import { drizzleRecurringExpenseRepository } from './drizzle-recurring-expense.repository';
import type { CreateRecurringExpenseInput } from './inputs/create-recurring-expense.input';
import type { UpdateRecurringExpenseInput } from './inputs/update-recurring-expense.input';
import {
	RecurringExpenseNotFoundError,
	RecurringExpenseValidationError
} from './recurring-expense.errors';
import type { RecurringExpenseRepository } from './recurring-expense.repository';

export class RecurringExpenseService {
	constructor(
		private readonly recurringExpenseRepository: RecurringExpenseRepository,
		private readonly categoryRepository: CategoryRepository
	) {}

	getRecurringExpenses() {
		return this.recurringExpenseRepository.list();
	}

	async createRecurringExpense(input: CreateRecurringExpenseInput): Promise<void> {
		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		await this.recurringExpenseRepository.create(normalizedInput);
	}

	async updateRecurringExpense(input: UpdateRecurringExpenseInput): Promise<void> {
		if (!(await this.recurringExpenseRepository.findById(input.id))) {
			throw new RecurringExpenseNotFoundError();
		}

		const normalizedInput = this.normalizeInput(input);
		await this.assertValidInput(normalizedInput);
		await this.recurringExpenseRepository.update(normalizedInput);
	}

	async deleteRecurringExpense(id: string): Promise<void> {
		if (!(await this.recurringExpenseRepository.findById(id))) {
			throw new RecurringExpenseNotFoundError();
		}

		await this.recurringExpenseRepository.delete(id);
	}

	private normalizeInput<T extends CreateRecurringExpenseInput>(input: T): T {
		return {
			...input,
			name: input.name.trim(),
			categoryId: input.categoryId.trim(),
			customIntervalCount: input.frequency === 'custom' ? input.customIntervalCount : null,
			customIntervalUnit: input.frequency === 'custom' ? input.customIntervalUnit : null,
			statementDay: input.statementDay,
			lastPaidAt: input.lastPaidAt?.trim() || null
		};
	}

	private async assertValidInput(input: CreateRecurringExpenseInput) {
		const errors: Record<string, string[]> = {};

		if (input.name.length === 0) errors.name = ['El nombre del gasto es obligatorio.'];
		if (input.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
			errors.amount = ['El monto debe ser mayor a 0.'];
		}
		if (!expenseAmountKinds.includes(input.amountKind)) errors.amountKind = ['El tipo de monto no es válido.'];
		if (!recurringExpenseFrequencies.includes(input.frequency)) errors.frequency = ['La frecuencia no es válida.'];
		if (input.categoryId.length === 0 || !(await this.categoryRepository.findById(input.categoryId))) {
			errors.categoryId = ['Selecciona una categoría existente.'];
		}
		if (!this.isPaymentScheduleForFrequency(input.paymentSchedule, input.frequency)) {
			errors.paymentSchedule = ['La configuración de pago no corresponde a la frecuencia.'];
		}
		if (input.frequency === 'custom') {
			if (!Number.isInteger(input.customIntervalCount) || !input.customIntervalCount || input.customIntervalCount < 1) {
				errors.customIntervalCount = ['El intervalo personalizado debe ser mayor a 0.'];
			}
			if (!input.customIntervalUnit || !expenseIntervalUnits.includes(input.customIntervalUnit)) {
				errors.customIntervalUnit = ['Selecciona el periodo del intervalo.'];
			}
		}
		if (input.statementDay !== null && !this.isNumericMonthDay(input.statementDay)) {
			errors.statementDay = ['El día de corte debe estar entre 1 y 31.'];
		}
		if (input.lastPaidAt !== null && !this.isIsoDate(input.lastPaidAt)) {
			errors.lastPaidAt = ['La última fecha de pago no es válida.'];
		}

		if (Object.keys(errors).length > 0) throw new RecurringExpenseValidationError(errors);
	}

	private isPaymentScheduleForFrequency(
		paymentSchedule: RecurringExpensePaymentSchedule,
		frequency: CreateRecurringExpenseInput['frequency']
	) {
		if (paymentSchedule.type !== frequency) return false;
		if (paymentSchedule.type === 'daily') return true;
		if (paymentSchedule.type === 'weekly') return weekDays.includes(paymentSchedule.weekday);
		if (paymentSchedule.type === 'semimonthly') {
			return this.isNumericMonthDay(paymentSchedule.firstDay) && this.isMonthDay(paymentSchedule.secondDay);
		}
		if (paymentSchedule.type === 'monthly') return this.isMonthDay(paymentSchedule.day);
		if (paymentSchedule.type === 'yearly') {
			return Number.isInteger(paymentSchedule.month) &&
				paymentSchedule.month >= 1 &&
				paymentSchedule.month <= 12 &&
				this.isMonthDay(paymentSchedule.day);
		}
		return true;
	}

	private isMonthDay(value: MonthDay) {
		return value === 'last' || this.isNumericMonthDay(value);
	}

	private isNumericMonthDay(value: number) {
		return Number.isInteger(value) && value >= 1 && value <= 31;
	}

	private isIsoDate(value: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
		const [year, month, day] = value.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
	}
}

export const recurringExpenseService = new RecurringExpenseService(
	drizzleRecurringExpenseRepository,
	drizzleCategoryRepository
);
