import {
	incomeFrequencies,
	incomeSources,
	type PaymentSchedule,
	type TimeBlock,
	type WorkDay,
	workDays,
	type WorkSchedule
} from '$lib/modules/recurring-incomes/types/recurring-income.types';
import { RecurringIncomeNotFoundError, RecurringIncomeValidationError } from './recurring-income.errors';
import type { RecurringIncomeRepository } from './recurring-income.repository';
import { drizzleRecurringIncomeRepository } from './drizzle-recurring-income.repository';
import type { CreateRecurringIncomeInput } from './inputs/create-recurring-income.input';
import type { UpdateRecurringIncomeInput } from './inputs/update-recurring-income.input';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class RecurringIncomeService {
	constructor(private readonly recurringIncomeRepository: RecurringIncomeRepository) {}

	getRecurringIncomes() {
		return this.recurringIncomeRepository.list();
	}

	async createRecurringIncome(input: CreateRecurringIncomeInput): Promise<void> {
		const normalizedInput = this.normalizeInput(input);
		this.assertValidInput(normalizedInput);
		await this.recurringIncomeRepository.create(normalizedInput);
	}

	async updateRecurringIncome(input: UpdateRecurringIncomeInput): Promise<void> {
		if (!(await this.recurringIncomeRepository.findById(input.id))) {
			throw new RecurringIncomeNotFoundError();
		}

		const normalizedInput = this.normalizeInput(input);
		this.assertValidInput(normalizedInput);
		await this.recurringIncomeRepository.update(normalizedInput);
	}

	async deleteRecurringIncome(id: string): Promise<void> {
		if (!(await this.recurringIncomeRepository.findById(id))) {
			throw new RecurringIncomeNotFoundError();
		}

		await this.recurringIncomeRepository.delete(id);
	}

	private normalizeInput<T extends CreateRecurringIncomeInput>(input: T): T {
		return {
			...input,
			title: input.title.trim(),
			workSchedule: input.source === 'work' ? this.normalizeWorkSchedule(input.workSchedule) : null
		};
	}

	private assertValidInput(input: CreateRecurringIncomeInput) {
		const errors: Record<string, string[]> = {};

		if (input.title.length === 0) errors.title = ['El nombre es obligatorio.'];
		if (input.title.length > 100) errors.title = ['El nombre debe tener máximo 100 caracteres.'];
		if (!Number.isInteger(input.expectedAmountCents) || input.expectedAmountCents <= 0) {
			errors.expectedAmount = ['El monto esperado debe ser mayor a 0.'];
		}
		if (!incomeSources.includes(input.source)) errors.source = ['La fuente del ingreso no es válida.'];
		if (!incomeFrequencies.includes(input.frequency)) errors.frequency = ['La frecuencia no es válida.'];
		if (!this.isPaymentScheduleForFrequency(input.paymentSchedule, input.frequency)) {
			errors.paymentSchedule = ['La configuración de pago no corresponde a la frecuencia.'];
		}

		const scheduleErrors = input.workSchedule ? this.validateWorkSchedule(input.workSchedule) : [];
		if (scheduleErrors.length > 0) errors.workSchedule = scheduleErrors;

		if (Object.keys(errors).length > 0) throw new RecurringIncomeValidationError(errors);
	}

	private isPaymentScheduleForFrequency(
		paymentSchedule: PaymentSchedule,
		frequency: CreateRecurringIncomeInput['frequency']
	) {
		if (paymentSchedule.type !== frequency) return false;
		if (paymentSchedule.type === 'daily') return true;
		if (paymentSchedule.type === 'weekly') return workDays.includes(paymentSchedule.weekday);
		if (paymentSchedule.type === 'monthly') return this.isMonthDay(paymentSchedule.day);
		return this.isMonthDay(paymentSchedule.firstDay) && this.isMonthDay(paymentSchedule.secondDay);
	}

	private isMonthDay(value: number | 'last') {
		return value === 'last' || (Number.isInteger(value) && value >= 1 && value <= 31);
	}

	private normalizeWorkSchedule(workSchedule: WorkSchedule | null): WorkSchedule | null {
		if (!workSchedule) return null;

		const normalizedSchedule: WorkSchedule = {};
		for (const day of workDays) {
			const blocks = workSchedule[day]?.filter((block) => block.startsAt && block.endsAt) ?? [];
			if (blocks.length > 0) {
				normalizedSchedule[day] = blocks.map((block) => ({
					startsAt: block.startsAt,
					endsAt: block.endsAt
				}));
			}
		}

		return Object.keys(normalizedSchedule).length > 0 ? normalizedSchedule : null;
	}

	private validateWorkSchedule(workSchedule: WorkSchedule) {
		const errors: string[] = [];

		for (const day of workDays) {
			const blocks = workSchedule[day] ?? [];
			const sortedBlocks = [...blocks].sort((a, b) => this.timeToMinutes(a.startsAt) - this.timeToMinutes(b.startsAt));

			for (const block of sortedBlocks) this.validateBlock(block, errors);

			for (let index = 1; index < sortedBlocks.length; index += 1) {
				if (this.timeToMinutes(sortedBlocks[index].startsAt) < this.timeToMinutes(sortedBlocks[index - 1].endsAt)) {
					errors.push('Los bloques horarios de un mismo día no deben superponerse.');
					break;
				}
			}
		}

		return [...new Set(errors)];
	}

	private validateBlock(block: TimeBlock, errors: string[]) {
		if (!timePattern.test(block.startsAt) || !timePattern.test(block.endsAt)) {
			errors.push('Los bloques horarios deben tener horas válidas.');
			return;
		}

		if (this.timeToMinutes(block.startsAt) >= this.timeToMinutes(block.endsAt)) {
			errors.push('La hora de inicio de un bloque debe ser anterior a su hora de fin.');
		}
	}

	private timeToMinutes(value: string) {
		const [hours = '0', minutes = '0'] = value.split(':');
		return Number(hours) * 60 + Number(minutes);
	}
}

export const recurringIncomeService = new RecurringIncomeService(drizzleRecurringIncomeRepository);
