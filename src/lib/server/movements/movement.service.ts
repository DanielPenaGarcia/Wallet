import type { Account } from '$lib/modules/accounts/types/account.types';
import { movementTypes, type MovementType } from '$lib/modules/movements/types/movement.types';
import { drizzleAccountRepository } from '$lib/server/accounts/drizzle-account.repository';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import { drizzleCategoryRepository } from '$lib/server/categories/drizzle-category.repository';
import type { CategoryRepository } from '$lib/server/categories/category.repository';
import { drizzleRecurringExpenseRepository } from '$lib/server/recurring-expenses/drizzle-recurring-expense.repository';
import type { RecurringExpenseRepository } from '$lib/server/recurring-expenses/recurring-expense.repository';
import { drizzleRecurringIncomeRepository } from '$lib/server/recurring-incomes/drizzle-recurring-income.repository';
import type { RecurringIncomeRepository } from '$lib/server/recurring-incomes/recurring-income.repository';
import { drizzleMovementRepository } from './drizzle-movement.repository';
import type { AccountBalanceChangeInput } from './inputs/account-balance-change.input';
import type { CreateMovementInput } from './inputs/create-movement.input';
import type { ListMovementsInput } from './inputs/list-movements.input';
import type { UpdateMovementInput } from './inputs/update-movement.input';
import { MovementNotFoundError, MovementValidationError } from './movement.errors';
import type { MovementRepository } from './movement.repository';
import type { MovementOutput } from './outputs/movement.output';

export class MovementService {
	constructor(
		private readonly movementRepository: MovementRepository,
		private readonly accountRepository: AccountRepository,
		private readonly categoryRepository: CategoryRepository,
		private readonly recurringExpenseRepository: RecurringExpenseRepository,
		private readonly recurringIncomeRepository: RecurringIncomeRepository
	) {}

	async getMovement(id: string) {
		const movement = await this.movementRepository.findById(id);
		if (!movement) throw new MovementNotFoundError();
		return movement;
	}

	listMovements(input: ListMovementsInput = {}) {
		return this.movementRepository.list(input);
	}

	async createMovement(input: CreateMovementInput) {
		const normalizedInput = this.normalizeMovementInput(input);

		await this.assertValidMovementInput(normalizedInput);
		const accountsById = await this.getMovementAccounts(normalizedInput);
		this.validateCreditTrackingBoundary(normalizedInput, accountsById);
		const balanceChanges = this.balanceChangesFromDeltas(
			accountsById,
			this.calculateImpactDeltas(normalizedInput)
		);
		this.validateBalanceChanges(balanceChanges, accountsById);

		return this.movementRepository.createWithBalanceChanges(normalizedInput, balanceChanges);
	}

	async updateMovement(input: UpdateMovementInput) {
		const original = await this.getActiveMovement(input.id);
		const normalizedInput = {
			...this.normalizeMovementInput(input),
			id: input.id.trim()
		};

		await this.assertValidMovementInput(normalizedInput);
		const accountsById = await this.getImpactedAccounts(original, normalizedInput);
		this.validateCreditTrackingBoundary(normalizedInput, accountsById);

		const reversalDeltas = this.reverseDeltas(this.calculateImpactDeltas(this.movementToInput(original)));
		const nextDeltas = this.calculateImpactDeltas(normalizedInput);
		const balancesAfterReversal = this.balanceChangesFromDeltas(accountsById, reversalDeltas);
		this.validateBalanceChanges(balancesAfterReversal, accountsById);

		const finalBalanceChanges = this.balanceChangesFromDeltas(
			accountsById,
			this.mergeDeltas(reversalDeltas, nextDeltas)
		);
		this.validateBalanceChanges(finalBalanceChanges, accountsById);

		return this.movementRepository.updateWithBalanceChanges(normalizedInput, finalBalanceChanges);
	}

	async deleteMovement(id: string) {
		const movement = await this.getActiveMovement(id);
		const accountsById = await this.getMovementAccounts(this.movementToInput(movement));
		const balanceChanges = this.balanceChangesFromDeltas(
			accountsById,
			this.reverseDeltas(this.calculateImpactDeltas(this.movementToInput(movement)))
		);
		this.validateBalanceChanges(balanceChanges, accountsById);

		await this.movementRepository.softDeleteWithBalanceChanges(movement.id, balanceChanges);
	}

	private normalizeMovementInput<T extends CreateMovementInput>(input: T): T {
		return {
			...input,
			title: input.title.trim(),
			description: input.description?.trim() || null,
			currencyCode: input.currencyCode.trim().toUpperCase(),
			sourceAccountId: input.sourceAccountId?.trim() || null,
			destinationAccountId: input.destinationAccountId?.trim() || null,
			categoryId: input.categoryId?.trim() || null,
			recurringExpenseId: input.recurringExpenseId?.trim() || null,
			recurringIncomeId: input.recurringIncomeId?.trim() || null
		};
	}

	private async getActiveMovement(id: string) {
		const movement = await this.movementRepository.findById(id.trim());
		if (!movement || !movement.active) throw new MovementNotFoundError();
		return movement;
	}

	private async assertValidMovementInput(input: CreateMovementInput) {
		const errors: Record<string, string[]> = {};

		if (!this.isMovementType(input.type)) errors.type = ['Selecciona un tipo de movimiento válido.'];
		if (input.title.length === 0) errors.title = ['El concepto es obligatorio.'];
		if (input.title.length > 160) errors.title = ['El concepto debe tener máximo 160 caracteres.'];
		if (input.description && input.description.length > 500) {
			errors.description = ['La descripción debe tener máximo 500 caracteres.'];
		}
		if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
			errors.amount = ['El monto debe ser mayor a 0.'];
		}
		if (!/^[A-Z]{3}$/.test(input.currencyCode)) {
			errors.currencyCode = ['La moneda debe usar un código ISO de 3 letras.'];
		}
		if (!this.isValidDateTime(input.occurredAt)) {
			errors.occurredAt = ['Captura una fecha efectiva válida.'];
		}

		await this.validateReferences(input, errors);
		await this.validateFinancialShape(input, errors);

		if (Object.keys(errors).length > 0) throw new MovementValidationError(errors);
	}

	private async getMovementAccounts(input: CreateMovementInput) {
		const accountIds = new Set([
			input.sourceAccountId,
			input.destinationAccountId
		].filter((accountId): accountId is string => Boolean(accountId)));
		const accountsById = new Map<string, Account>();

		for (const accountId of accountIds) {
			const account = await this.accountRepository.findById(accountId);
			if (account) accountsById.set(account.id, account);
		}

		return accountsById;
	}

	private async getImpactedAccounts(original: MovementOutput, next: CreateMovementInput) {
		const accountIds = new Set([
			...this.accountIdsForMovement(this.movementToInput(original)),
			...this.accountIdsForMovement(next)
		]);
		const accountsById = new Map<string, Account>();

		for (const accountId of accountIds) {
			const account = await this.accountRepository.findById(accountId);
			if (account) accountsById.set(account.id, account);
		}

		return accountsById;
	}

	private accountIdsForMovement(input: CreateMovementInput) {
		return [
			input.sourceAccountId,
			input.destinationAccountId
		].filter((accountId): accountId is string => Boolean(accountId));
	}

	private movementToInput(movement: MovementOutput): CreateMovementInput {
		return {
			type: movement.type,
			title: movement.title,
			description: movement.description,
			amountCents: movement.amountCents,
			currencyCode: movement.currencyCode,
			occurredAt: movement.occurredAt,
			sourceAccountId: movement.sourceAccountId,
			destinationAccountId: movement.destinationAccountId,
			categoryId: movement.categoryId,
			recurringExpenseId: movement.recurringExpenseId,
			recurringIncomeId: movement.recurringIncomeId
		};
	}

	private async validateReferences(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (input.sourceAccountId && !(await this.accountRepository.findById(input.sourceAccountId))) {
			errors.sourceAccountId = ['Selecciona una cuenta origen existente.'];
		}
		if (input.destinationAccountId && !(await this.accountRepository.findById(input.destinationAccountId))) {
			errors.destinationAccountId = ['Selecciona una cuenta destino existente.'];
		}
		if (input.categoryId && !(await this.categoryRepository.findById(input.categoryId))) {
			errors.categoryId = ['Selecciona una categoría existente.'];
		}
		if (input.recurringExpenseId && !(await this.recurringExpenseRepository.findById(input.recurringExpenseId))) {
			errors.recurringExpenseId = ['Selecciona un gasto recurrente existente.'];
		}
		if (input.recurringIncomeId && !(await this.recurringIncomeRepository.findById(input.recurringIncomeId))) {
			errors.recurringIncomeId = ['Selecciona un ingreso recurrente existente.'];
		}
	}

	private async validateFinancialShape(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (input.type === 'income') {
			this.requireDestinationOnly(input, errors);
			await this.requireRealDestinationAccount(input, errors);
			if (input.recurringExpenseId) errors.recurringExpenseId = ['Un ingreso no materializa un gasto recurrente.'];
		}
		if (input.type === 'expense') {
			this.requireSourceOnly(input, errors);
			await this.requireRealSourceAccount(input, errors);
			this.requireExpenseClassification(input, errors);
			if (input.recurringIncomeId) errors.recurringIncomeId = ['Un gasto no materializa un ingreso recurrente.'];
		}
		if (input.type === 'credit_purchase') {
			this.requireSourceOnly(input, errors);
			await this.requireCreditSourceAccount(input, errors);
			this.requireExpenseClassification(input, errors);
			if (input.recurringIncomeId) errors.recurringIncomeId = ['Una compra con crédito no materializa un ingreso recurrente.'];
		}
		if (input.type === 'transfer') {
			this.requireSourceAndDestination(input, errors);
			await this.requireRealSourceAccount(input, errors);
			await this.requireRealDestinationAccount(input, errors);
			this.rejectClassification(input, errors);
		}
		if (input.type === 'credit_card_payment') {
			this.requireSourceAndDestination(input, errors);
			await this.requireRealSourceAccount(input, errors);
			await this.requireCreditDestinationAccount(input, errors);
			this.rejectClassification(input, errors);
		}
		if (input.type === 'adjustment') {
			this.requireSingleAccount(input, errors);
			this.rejectClassification(input, errors);
		}
	}

	private calculateImpactDeltas(input: CreateMovementInput) {
		const deltas = new Map<string, number>();
		const applyDelta = (accountId: string | null, deltaCents: number) => {
			if (!accountId) return;
			deltas.set(accountId, (deltas.get(accountId) ?? 0) + deltaCents);
		};

		if (input.type === 'income') applyDelta(input.destinationAccountId, input.amountCents);
		if (input.type === 'expense') applyDelta(input.sourceAccountId, -input.amountCents);
		if (input.type === 'credit_purchase') applyDelta(input.sourceAccountId, input.amountCents);
		if (input.type === 'credit_card_payment') {
			applyDelta(input.sourceAccountId, -input.amountCents);
			applyDelta(input.destinationAccountId, -input.amountCents);
		}
		if (input.type === 'transfer') {
			applyDelta(input.sourceAccountId, -input.amountCents);
			applyDelta(input.destinationAccountId, input.amountCents);
		}
		if (input.type === 'adjustment') {
			applyDelta(input.sourceAccountId, -input.amountCents);
			applyDelta(input.destinationAccountId, input.amountCents);
		}

		return deltas;
	}

	private reverseDeltas(deltas: Map<string, number>) {
		return new Map(Array.from(deltas, ([accountId, deltaCents]) => [accountId, -deltaCents]));
	}

	private mergeDeltas(...deltasList: Array<Map<string, number>>) {
		const merged = new Map<string, number>();

		for (const deltas of deltasList) {
			for (const [accountId, deltaCents] of deltas) {
				merged.set(accountId, (merged.get(accountId) ?? 0) + deltaCents);
			}
		}

		return merged;
	}

	private balanceChangesFromDeltas(
		accountsById: Map<string, Account>,
		deltas: Map<string, number>
	): AccountBalanceChangeInput[] {
		return Array.from(deltas, ([accountId, deltaCents]) => {
			const account = accountsById.get(accountId);
			if (!account) return null;
			return {
				accountId,
				newBalanceCents: account.balanceCents + deltaCents
			};
		}).filter((change): change is AccountBalanceChangeInput => change !== null);
	}

	private validateBalanceChanges(
		balanceChanges: Array<{ accountId: string; newBalanceCents: number }>,
		accountsById: Map<string, Account>
	) {
		const errors: Record<string, string[]> = {};

		for (const change of balanceChanges) {
			const account = accountsById.get(change.accountId);
			if (!account) continue;

			if (change.newBalanceCents < 0) {
				errors.balance = [`El movimiento dejaría la cuenta "${account.name}" con saldo negativo.`];
			}
			if (
				account.type === 'credit' &&
				account.creditLimitCents !== null &&
				change.newBalanceCents > account.creditLimitCents
			) {
				errors.balance = [`El movimiento supera el límite de crédito de "${account.name}".`];
			}
		}

		if (Object.keys(errors).length > 0) throw new MovementValidationError(errors);
	}

	private validateCreditTrackingBoundary(input: CreateMovementInput, accountsById: Map<string, Account>) {
		const movementDate = input.occurredAt.slice(0, 10);
		const blockedAccount = Array.from(accountsById.values()).find(
			(account) => account.type === 'credit' && movementDate <= account.balanceAsOfDate
		);

		if (blockedAccount) {
			throw new MovementValidationError({
				occurredAt: [
					`La fecha del movimiento debe ser posterior a la fecha de referencia de "${blockedAccount.name}".`
				]
			});
		}
	}

	private requireDestinationOnly(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (input.sourceAccountId) errors.sourceAccountId = ['Este movimiento no debe tener cuenta origen.'];
		if (!input.destinationAccountId) errors.destinationAccountId = ['Selecciona una cuenta destino.'];
	}

	private requireSourceOnly(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.sourceAccountId) errors.sourceAccountId = ['Selecciona una cuenta origen.'];
		if (input.destinationAccountId) errors.destinationAccountId = ['Este movimiento no debe tener cuenta destino.'];
	}

	private requireSourceAndDestination(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.sourceAccountId) errors.sourceAccountId = ['Selecciona una cuenta origen.'];
		if (!input.destinationAccountId) errors.destinationAccountId = ['Selecciona una cuenta destino.'];
		if (
			input.sourceAccountId &&
			input.destinationAccountId &&
			input.sourceAccountId === input.destinationAccountId
		) {
			errors.destinationAccountId = ['La cuenta destino debe ser distinta de la cuenta origen.'];
		}
	}

	private async requireRealSourceAccount(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.sourceAccountId || errors.sourceAccountId) return;
		const account = await this.accountRepository.findById(input.sourceAccountId);
		if (account && account.type === 'credit') {
			errors.sourceAccountId = ['Selecciona una cuenta origen de dinero real.'];
		}
	}

	private async requireRealDestinationAccount(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.destinationAccountId || errors.destinationAccountId) return;
		const account = await this.accountRepository.findById(input.destinationAccountId);
		if (account && account.type === 'credit') {
			errors.destinationAccountId = ['Selecciona una cuenta destino de dinero real.'];
		}
	}

	private async requireCreditSourceAccount(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.sourceAccountId || errors.sourceAccountId) return;
		const account = await this.accountRepository.findById(input.sourceAccountId);
		if (account && account.type !== 'credit') {
			errors.sourceAccountId = ['Selecciona una tarjeta de crédito como cuenta origen.'];
		}
	}

	private async requireCreditDestinationAccount(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.destinationAccountId || errors.destinationAccountId) return;
		const account = await this.accountRepository.findById(input.destinationAccountId);
		if (account && account.type !== 'credit') {
			errors.destinationAccountId = ['Selecciona una tarjeta de crédito como cuenta destino.'];
		}
	}

	private requireSingleAccount(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.sourceAccountId && !input.destinationAccountId) {
			errors.sourceAccountId = ['Selecciona la cuenta afectada por el ajuste.'];
		}
		if (input.sourceAccountId && input.destinationAccountId) {
			errors.destinationAccountId = ['Un ajuste explícito solo puede afectar una cuenta.'];
		}
	}

	private requireExpenseClassification(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (!input.categoryId && !input.recurringExpenseId) {
			errors.categoryId = ['Clasifica el movimiento con una categoría o gasto recurrente.'];
		}
		if (input.categoryId && input.recurringExpenseId) {
			errors.categoryId = ['Usa solo una clasificación para el movimiento.'];
		}
	}

	private rejectClassification(input: CreateMovementInput, errors: Record<string, string[]>) {
		if (input.categoryId) errors.categoryId = ['Este tipo de movimiento no se categoriza como gasto o ingreso.'];
		if (input.recurringExpenseId) errors.recurringExpenseId = ['Este tipo de movimiento no materializa un gasto recurrente.'];
		if (input.recurringIncomeId) errors.recurringIncomeId = ['Este tipo de movimiento no materializa un ingreso recurrente.'];
	}

	private isMovementType(type: string): type is MovementType {
		return movementTypes.includes(type as MovementType);
	}

	private isValidDateTime(value: string) {
		const timestamp = Date.parse(value);
		return Number.isFinite(timestamp);
	}
}

export const movementService = new MovementService(
	drizzleMovementRepository,
	drizzleAccountRepository,
	drizzleCategoryRepository,
	drizzleRecurringExpenseRepository,
	drizzleRecurringIncomeRepository
);
