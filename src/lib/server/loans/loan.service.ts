import { loanDirections, type Loan, type LoanSummary } from '$lib/modules/loans/types/loan.types';
import { summarizeLoan } from '$lib/modules/loans/utils/loan-calculations';
import { drizzleAccountRepository } from '$lib/server/accounts/drizzle-account.repository';
import type { AccountRepository } from '$lib/server/accounts/account.repository';
import { movementService, type MovementService } from '$lib/server/movements/movement.service';
import { MovementValidationError } from '$lib/server/movements/movement.errors';
import { drizzleLoanRepository } from './drizzle-loan.repository';
import type { CreateLoanInput } from './inputs/create-loan.input';
import type { LoanSettlementInput } from './inputs/loan-settlement.input';
import type { UpdateLoanInput } from './inputs/update-loan.input';
import { LoanNotFoundError, LoanValidationError } from './loan.errors';
import type { LoanRepository } from './loan.repository';

export class LoanService {
	constructor(
		private readonly loanRepository: LoanRepository,
		private readonly accountRepository: AccountRepository,
		private readonly movements: MovementService
	) {}

	async getLoans(): Promise<LoanSummary[]> {
		const [loans, paymentTotals] = await Promise.all([
			this.loanRepository.list(),
			this.loanRepository.listPaymentTotals()
		]);
		const paidByLoanId = new Map(paymentTotals.map((total) => [total.loanId, total.paidAmountCents]));

		return loans.map((loan) => summarizeLoan(loan, paidByLoanId.get(loan.id) ?? 0));
	}

	async getLoan(id: string): Promise<LoanSummary> {
		const loan = await this.loanRepository.findById(id.trim());
		if (!loan) throw new LoanNotFoundError();
		return summarizeLoan(loan, await this.loanRepository.getPaymentTotal(loan.id));
	}

	async createLoan(input: CreateLoanInput): Promise<LoanSummary> {
		const normalizedInput = this.normalizeCreateInput(input);
		await this.assertValidCreateInput(normalizedInput);
		const id = crypto.randomUUID();
		const loan = await this.loanRepository.create({ ...normalizedInput, id });

		await this.movements.createMovement({
			type: loan.direction === 'borrowed' ? 'loan_received' : 'loan_disbursement',
			title: loan.direction === 'borrowed' ? `Préstamo recibido: ${loan.name}` : `Préstamo entregado: ${loan.name}`,
			description: `Contraparte: ${loan.counterpartyName}`,
			amountCents: loan.principalAmountCents,
			currencyCode: loan.currencyCode,
			occurredAt: normalizedInput.occurredAt,
			sourceAccountId: loan.direction === 'lent' ? normalizedInput.accountId : null,
			destinationAccountId: loan.direction === 'borrowed' ? normalizedInput.accountId : null,
			categoryId: null,
			recurringExpenseId: null,
			recurringIncomeId: null,
			loanId: loan.id
		});

		return summarizeLoan(loan, 0);
	}

	async updateLoan(input: UpdateLoanInput): Promise<void> {
		const loan = await this.loanRepository.findById(input.id.trim());
		if (!loan) throw new LoanNotFoundError();
		if (loan.status !== 'active') throw new LoanValidationError({ status: ['Solo puedes editar préstamos activos.'] });

		const normalizedInput = this.normalizeUpdateInput(input);
		this.assertValidLoanTerms(normalizedInput);
		await this.assertEditableAgainstSettlements(loan, normalizedInput);
		await this.updateOpeningMovementAtomically(loan, normalizedInput);
	}

	async cancelLoan(id: string): Promise<void> {
		const loan = await this.loanRepository.findById(id.trim());
		if (!loan) throw new LoanNotFoundError();
		if (loan.status !== 'active') return;
		await this.loanRepository.cancel(loan.id);
	}

	async deleteLoan(id: string): Promise<void> {
		const loan = await this.loanRepository.findById(id.trim());
		if (!loan) throw new LoanNotFoundError();

		const orderedMovements = (await this.movements.listMovements({ loanId: loan.id })).sort((a, b) => {
			const directionOrder = loan.direction === 'borrowed'
				? Number(this.isLoanOpeningMovement(a.type)) - Number(this.isLoanOpeningMovement(b.type))
				: Number(this.isLoanOpeningMovement(b.type)) - Number(this.isLoanOpeningMovement(a.type));
			return directionOrder || b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id);
		});

		try {
			const preparedDeletion = await this.movements.prepareMovementDeletionBatch(
				orderedMovements.map((movement) => movement.id)
			);
			await this.loanRepository.deleteWithMovementReversals(
				loan.id,
				preparedDeletion.ids,
				preparedDeletion.balanceChanges
			);
		} catch (error) {
			if (error instanceof MovementValidationError) {
				throw new LoanValidationError({
					id: ['No se puede eliminar el préstamo porque al revertir sus movimientos alguna cuenta quedaría con saldo inválido.']
				});
			}
			throw error;
		}
	}

	async registerPayment(input: LoanSettlementInput): Promise<void> {
		const loan = await this.getActiveLoan(input.id);
		if (loan.direction !== 'borrowed') throw new LoanValidationError({ id: ['Selecciona un préstamo por pagar.'] });
		await this.registerSettlement(loan, this.normalizeSettlementInput(input), 'loan_payment');
	}

	async registerCollection(input: LoanSettlementInput): Promise<void> {
		const loan = await this.getActiveLoan(input.id);
		if (loan.direction !== 'lent') throw new LoanValidationError({ id: ['Selecciona un préstamo por cobrar.'] });
		await this.registerSettlement(loan, this.normalizeSettlementInput(input), 'loan_collection');
	}

	private async getActiveLoan(id: string) {
		const loan = await this.loanRepository.findById(id.trim());
		if (!loan) throw new LoanNotFoundError();
		if (loan.status !== 'active') throw new LoanValidationError({ id: ['El préstamo debe estar activo.'] });
		return loan;
	}

	private async registerSettlement(
		loan: Loan,
		input: LoanSettlementInput,
		type: 'loan_payment' | 'loan_collection'
	) {
		const errors: Record<string, string[]> = {};
		if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
			errors.amount = ['El monto debe ser mayor a 0.'];
		}
		if (!this.isValidDateTime(input.occurredAt)) errors.occurredAt = ['Captura una fecha efectiva válida.'];
		const paidAmountCents = await this.loanRepository.getPaymentTotal(loan.id);
		const outstandingAmountCents = Math.max(loan.totalRepaymentCents - paidAmountCents, 0);
		if (input.amountCents > outstandingAmountCents) {
			errors.amount = ['El monto no puede superar el saldo pendiente del préstamo.'];
		}
		if (Object.keys(errors).length > 0) throw new LoanValidationError(errors);

		await this.movements.createMovement({
			type,
			title: type === 'loan_payment' ? `Pago préstamo: ${loan.name}` : `Cobro préstamo: ${loan.name}`,
			description: input.description,
			amountCents: input.amountCents,
			currencyCode: loan.currencyCode,
			occurredAt: input.occurredAt,
			sourceAccountId: type === 'loan_payment' ? input.accountId : null,
			destinationAccountId: type === 'loan_collection' ? input.accountId : null,
			categoryId: null,
			recurringExpenseId: null,
			recurringIncomeId: null,
			loanId: loan.id
		});
	}

	private async assertEditableAgainstSettlements(loan: Loan, input: UpdateLoanInput) {
		const errors: Record<string, string[]> = {};
		const paidAmountCents = await this.loanRepository.getPaymentTotal(loan.id);

		if (input.currencyCode !== loan.currencyCode) {
			errors.currencyCode = ['La moneda del préstamo no se puede cambiar después de crearlo.'];
		}
		if (paidAmountCents > input.totalRepaymentCents) {
			errors.totalRepayment = ['El total contractual no puede ser menor que lo ya pagado o cobrado.'];
		}

		if (paidAmountCents > 0) {
			if (input.principalAmountCents !== loan.principalAmountCents) {
				errors.principalAmount = ['No puedes cambiar el principal cuando ya existen pagos o cobros.'];
			}
			if (input.totalRepaymentCents !== loan.totalRepaymentCents) {
				errors.totalRepayment = ['No puedes cambiar el total contractual cuando ya existen pagos o cobros.'];
			}
			if (input.installmentCount !== loan.installmentCount) {
				errors.installmentCount = ['No puedes cambiar las cuotas cuando ya existen pagos o cobros.'];
			}
			if (input.firstPaymentDate !== loan.firstPaymentDate) {
				errors.firstPaymentDate = ['No puedes cambiar el calendario cuando ya existen pagos o cobros.'];
			}
		}

		if (Object.keys(errors).length > 0) throw new LoanValidationError(errors);
	}

	private async updateOpeningMovementAtomically(loan: Loan, input: UpdateLoanInput) {
		const openingType = loan.direction === 'borrowed' ? 'loan_received' : 'loan_disbursement';
		const openingMovement = (await this.movements.listMovements({ loanId: loan.id, type: openingType }))[0];
		if (!openingMovement) throw new LoanValidationError({ id: ['No se encontró el movimiento de apertura del préstamo.'] });

		try {
			const preparedUpdate = await this.movements.prepareMovementUpdate({
				id: openingMovement.id,
				type: openingMovement.type,
				title: loan.direction === 'borrowed' ? `Préstamo recibido: ${input.name}` : `Préstamo entregado: ${input.name}`,
				description: `Contraparte: ${input.counterpartyName}`,
				amountCents: input.principalAmountCents,
				currencyCode: loan.currencyCode,
				occurredAt: openingMovement.occurredAt,
				sourceAccountId: openingMovement.sourceAccountId,
				destinationAccountId: openingMovement.destinationAccountId,
				categoryId: null,
				recurringExpenseId: null,
				recurringIncomeId: null,
				loanId: loan.id
			});

			await this.loanRepository.updateWithOpeningMovement(
				input,
				preparedUpdate.input,
				preparedUpdate.balanceChanges
			);
		} catch (error) {
			if (error instanceof MovementValidationError) {
				throw this.loanErrorFromMovementError(error);
			}
			throw error;
		}
	}

	private loanErrorFromMovementError(error: MovementValidationError) {
		const balanceError = error.errors.balance?.[0];
		return new LoanValidationError({
			principalAmount: [
				balanceError
					? `No puedes ajustar el principal porque ${balanceError.toLowerCase()}`
					: 'No puedes ajustar el principal porque el movimiento de apertura no puede revertirse de forma segura.'
			]
		});
	}

	private isLoanOpeningMovement(type: string) {
		return type === 'loan_received' || type === 'loan_disbursement';
	}

	private normalizeCreateInput(input: CreateLoanInput): CreateLoanInput {
		return {
			...input,
			name: input.name.trim(),
			direction: input.direction,
			counterpartyName: input.counterpartyName.trim(),
			currencyCode: input.currencyCode.trim().toUpperCase(),
			accountId: input.accountId.trim(),
			firstPaymentDate: input.firstPaymentDate.trim(),
			occurredAt: input.occurredAt.trim()
		};
	}

	private normalizeUpdateInput(input: UpdateLoanInput): UpdateLoanInput {
		return {
			...input,
			id: input.id.trim(),
			name: input.name.trim(),
			counterpartyName: input.counterpartyName.trim(),
			currencyCode: input.currencyCode.trim().toUpperCase(),
			firstPaymentDate: input.firstPaymentDate.trim()
		};
	}

	private normalizeSettlementInput(input: LoanSettlementInput): LoanSettlementInput {
		return {
			...input,
			id: input.id.trim(),
			accountId: input.accountId.trim(),
			occurredAt: input.occurredAt.trim(),
			description: input.description?.trim() || null
		};
	}

	private async assertValidCreateInput(input: CreateLoanInput) {
		this.assertValidLoanTerms(input);

		const errors: Record<string, string[]> = {};
		if (!loanDirections.includes(input.direction)) errors.direction = ['Selecciona un tipo de préstamo válido.'];
		if (!input.accountId) errors.accountId = ['Selecciona una cuenta.'];
		const account = input.accountId ? await this.accountRepository.findById(input.accountId) : null;
		if (input.accountId && !account) errors.accountId = ['Selecciona una cuenta existente.'];
		if (account?.type === 'credit') errors.accountId = ['Selecciona una cuenta de dinero real.'];
		if (input.direction === 'lent' && account && account.balanceCents < input.principalAmountCents) {
			errors.accountId = ['La cuenta no tiene saldo suficiente para entregar el préstamo.'];
		}
		if (!this.isValidDateTime(input.occurredAt)) errors.occurredAt = ['Captura una fecha efectiva válida.'];

		if (Object.keys(errors).length > 0) throw new LoanValidationError(errors);
	}

	private assertValidLoanTerms(input: Pick<CreateLoanInput, 'name' | 'counterpartyName' | 'principalAmountCents' | 'totalRepaymentCents' | 'installmentCount' | 'firstPaymentDate' | 'currencyCode'>) {
		const errors: Record<string, string[]> = {};
		if (input.name.length === 0) errors.name = ['El nombre es obligatorio.'];
		if (input.name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
		if (input.counterpartyName.length === 0) errors.counterpartyName = ['La contraparte es obligatoria.'];
		if (input.counterpartyName.length > 100) errors.counterpartyName = ['La contraparte debe tener máximo 100 caracteres.'];
		if (!Number.isInteger(input.principalAmountCents) || input.principalAmountCents <= 0) {
			errors.principalAmount = ['El principal debe ser mayor a 0.'];
		}
		if (!Number.isInteger(input.totalRepaymentCents) || input.totalRepaymentCents <= 0) {
			errors.totalRepayment = ['El total contractual debe ser mayor a 0.'];
		}
		if (
			Number.isInteger(input.principalAmountCents) &&
			Number.isInteger(input.totalRepaymentCents) &&
			input.totalRepaymentCents < input.principalAmountCents
		) {
			errors.totalRepayment = ['El total contractual no puede ser menor que el principal.'];
		}
		if (!Number.isInteger(input.installmentCount) || input.installmentCount <= 0) {
			errors.installmentCount = ['El número de cuotas debe ser mayor a 0.'];
		}
		if (!this.isIsoDate(input.firstPaymentDate)) errors.firstPaymentDate = ['Captura una fecha de primer pago válida.'];
		if (!/^[A-Z]{3}$/.test(input.currencyCode)) errors.currencyCode = ['La moneda debe tener 3 letras.'];

		if (Object.keys(errors).length > 0) throw new LoanValidationError(errors);
	}

	private isIsoDate(value: string) {
		return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00`));
	}

	private isValidDateTime(value: string) {
		return Number.isFinite(Date.parse(value));
	}
}

export const loanService = new LoanService(
	drizzleLoanRepository,
	drizzleAccountRepository,
	movementService
);
