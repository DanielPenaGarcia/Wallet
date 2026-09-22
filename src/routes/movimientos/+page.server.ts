import { fail, type Actions } from '@sveltejs/kit';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { CardColor } from '$lib/modules/cards/types/card.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { Expense, ExpenseAmountKind, ExpenseFrequency } from '$lib/modules/expenses/types/expense.types';
import { movementTypes, type Movement, type MovementClassificationKind, type MovementType } from '$lib/modules/movements/types/movement.types';
import type { MovementFormValues } from '$lib/modules/movements/types/movement-form-feedback.types';
import { getCategoryPath } from '$lib/modules/expenses/utils/category-path';
import { toCardListItem } from '$lib/modules/accounts/utils/account-card-list-item';
import { accountService } from '$lib/server/accounts/account.service';
import { categoryService } from '$lib/server/categories/category.service';
import { MovementNotFoundError, MovementValidationError } from '$lib/server/movements/movement.errors';
import { movementService } from '$lib/server/movements/movement.service';
import { loanService } from '$lib/server/loans/loan.service';
import type { CreateMovementInput } from '$lib/server/movements/inputs/create-movement.input';
import type { UpdateMovementInput } from '$lib/server/movements/inputs/update-movement.input';
import type { MovementOutput } from '$lib/server/movements/outputs/movement.output';
import { recurringExpenseService } from '$lib/server/recurring-expenses/recurring-expense.service';
import type { RecurringExpense } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import { recurringIncomeService } from '$lib/server/recurring-incomes/recurring-income.service';
import type { RecurringIncome } from '$lib/modules/recurring-incomes/types/recurring-income.types';

const allFilterValue = 'all';
const noSelectionValue = 'none';

export async function load({ url }) {
	const filters = {
		startDate: url.searchParams.get('startDate') ?? '',
		endDate: url.searchParams.get('endDate') ?? '',
		cardId: normalizedFilter(url.searchParams.get('cardId')),
		categoryId: normalizedFilter(url.searchParams.get('categoryId')),
		type: normalizedFilter(url.searchParams.get('type'))
	};
	const [accounts, categories, recurringExpenses, recurringIncomes] = await Promise.all([
		accountService.getAccounts(),
		categoryService.getCategories(),
		recurringExpenseService.getRecurringExpenses(),
		recurringIncomeService.getRecurringIncomes()
	]);
	const loans = await loanService.getLoans();
	const movements = await movementService.listMovements({
		accountId: filters.cardId || undefined,
		categoryId: filters.categoryId || undefined,
		type: isMovementType(filters.type) ? filters.type : undefined,
		startDate: filters.startDate ? `${filters.startDate}T00:00:00.000Z` : undefined,
		endDate: filters.endDate ? `${filters.endDate}T23:59:59.999Z` : undefined
	});

	return {
		movements: movements.map((movement) => toMovement(movement, accounts, categories, recurringExpenses, recurringIncomes, loans)),
		cards: accounts.map(toCardListItem),
		expenses: recurringExpenses.map((expense) => toExpense(expense, categories)),
		incomes: recurringIncomes,
		categories,
		filters
	};
}

function normalizedFilter(value: string | null) {
	return !value || value === allFilterValue ? '' : value;
}

function normalizedOptionalSelect(value: string | null) {
	return !value || value === allFilterValue || value === noSelectionValue ? '' : value;
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function amountCents(value: string) {
	const amount = Number(value);
	return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

function dateTime(value: string) {
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function isMovementType(type: string): type is MovementType {
	return movementTypes.includes(type as MovementType);
}

function movementValues(formData: FormData): MovementFormValues & {
	id: string;
	adjustmentDirection: string;
	adjustmentAccountId: string;
} {
	return {
		id: formValue(formData, 'id'),
		type: formValue(formData, 'type') as MovementType,
		title: formValue(formData, 'title'),
		reason: formValue(formData, 'reason'),
		amount: formValue(formData, 'amount'),
		occurredAt: formValue(formData, 'occurredAt'),
		sourceCardId: formValue(formData, 'sourceCardId'),
		destinationCardId: formValue(formData, 'destinationCardId'),
		classificationKind: formValue(formData, 'classificationKind') as MovementClassificationKind,
		classificationId: formValue(formData, 'classificationId'),
		loanId: formValue(formData, 'loanId'),
		recurringIncomeId: normalizedOptionalSelect(formValue(formData, 'recurringIncomeId')),
		paymentMode: formValue(formData, 'paymentMode') === 'installments' ? 'installments' : 'cash',
		installmentCount: formValue(formData, 'installmentCount'),
		interestFree: formData.get('interestFree') === 'true' || formData.get('interestFree') === 'on',
		adjustmentDirection: formValue(formData, 'adjustmentDirection'),
		adjustmentAccountId: formValue(formData, 'adjustmentAccountId')
	};
}

function validateMovementValues(values: ReturnType<typeof movementValues>) {
	const errors: Record<string, string[]> = {};
	const type = values.type;
	const amount = amountCents(values.amount ?? '');

	if (!isMovementType(type ?? '')) errors.type = ['Selecciona un tipo de movimiento válido.'];
	if (!Number.isInteger(amount) || amount <= 0) errors.amount = ['El monto debe ser mayor a 0.'];
	if (!values.occurredAt) errors.occurredAt = ['Captura una fecha efectiva.'];
	if (!values.title?.trim()) errors.title = ['El concepto es obligatorio.'];

	const input: CreateMovementInput = {
		type: isMovementType(type ?? '') ? type as MovementType : 'expense',
		title: values.title ?? '',
		description: values.reason || null,
		amountCents: amount,
		currencyCode: 'MXN',
		occurredAt: dateTime(values.occurredAt ?? ''),
		sourceAccountId: values.sourceCardId || null,
		destinationAccountId: values.destinationCardId || null,
		categoryId: values.classificationKind === 'category' ? values.classificationId || null : null,
		recurringExpenseId: values.classificationKind === 'expense' ? values.classificationId || null : null,
		recurringIncomeId: values.recurringIncomeId || null,
		loanId: values.loanId || null
	};

	if (input.type === 'income') {
		input.description = values.reason || null;
		input.sourceAccountId = null;
		input.categoryId = null;
		input.recurringExpenseId = null;
		input.loanId = null;
	}
	if (input.type === 'transfer' || input.type === 'credit_card_payment') {
		input.description = null;
		input.categoryId = null;
		input.recurringExpenseId = null;
		input.loanId = null;
	}
	if (input.type === 'adjustment') {
		input.description = values.reason || null;
		input.categoryId = null;
		input.recurringExpenseId = null;
		input.loanId = null;
		input.sourceAccountId = values.adjustmentDirection === 'decrease' ? values.adjustmentAccountId || null : null;
		input.destinationAccountId = values.adjustmentDirection === 'increase' ? values.adjustmentAccountId || null : null;
	}

	return { errors, input };
}

export const actions: Actions = {
	createMovement: async ({ request }) => {
		const values = movementValues(await request.formData());
		const { errors, input } = validateMovementValues(values);
		if (Object.keys(errors).length > 0) return fail(400, { action: 'create-movement' as const, errors, values });

		try {
			await movementService.createMovement(input);
			return { action: 'create-movement' as const, success: 'Movimiento registrado.' };
		} catch (error) {
			if (error instanceof MovementValidationError) return fail(400, { action: 'create-movement' as const, errors: error.errors, values });
			throw error;
		}
	},
	updateMovement: async ({ request }) => {
		const values = movementValues(await request.formData());
		const { errors, input } = validateMovementValues(values);
		if (!values.id?.trim()) errors.id = ['El movimiento es obligatorio.'];
		if (Object.keys(errors).length > 0) return fail(400, { action: 'update-movement' as const, targetId: values.id, errors, values });

		try {
			await movementService.updateMovement({ ...input, id: values.id } satisfies UpdateMovementInput);
			return { action: 'update-movement' as const, success: 'Movimiento actualizado.' };
		} catch (error) {
			if (error instanceof MovementValidationError) return fail(400, { action: 'update-movement' as const, targetId: values.id, errors: error.errors, values });
			if (error instanceof MovementNotFoundError) return fail(400, { action: 'update-movement' as const, targetId: values.id, message: error.message, values });
			throw error;
		}
	},
	deleteMovement: async ({ request }) => {
		const id = formValue(await request.formData(), 'id').trim();
		if (!id) return fail(400, { action: 'delete-movement' as const, targetId: id, message: 'El movimiento es obligatorio.' });

		try {
			await movementService.deleteMovement(id);
			return { action: 'delete-movement' as const, success: 'Movimiento eliminado.' };
		} catch (error) {
			if (error instanceof MovementValidationError) return fail(400, { action: 'delete-movement' as const, targetId: id, errors: error.errors });
			if (error instanceof MovementNotFoundError) return fail(400, { action: 'delete-movement' as const, targetId: id, message: error.message });
			throw error;
		}
	},
	bulkCreateMovements: async ({ request }) => {
		const raw = formValue(await request.formData(), 'movements');
		let drafts: ReturnType<typeof movementValues>[] = [];
		try {
			drafts = JSON.parse(raw) as ReturnType<typeof movementValues>[];
		} catch {
			return fail(400, { action: 'bulk-create-movements' as const, message: 'No se pudo leer el lote.' });
		}

		try {
			for (const draft of drafts) {
				const { errors, input } = validateMovementValues({
					...draft,
					id: draft.id ?? '',
					adjustmentDirection: '',
					adjustmentAccountId: ''
				});
				if (Object.keys(errors).length > 0) throw new MovementValidationError(errors);
				await movementService.createMovement(input);
			}
			return { action: 'bulk-create-movements' as const, success: 'Lote registrado.' };
		} catch (error) {
			if (error instanceof MovementValidationError) return fail(400, { action: 'bulk-create-movements' as const, errors: error.errors, message: 'Revisa los datos del lote.' });
			throw error;
		}
	},
	bulkDeleteMovements: async ({ request }) => {
		const ids = (await request.formData()).getAll('ids').filter((id): id is string => typeof id === 'string');
		if (ids.length === 0) return fail(400, { action: 'bulk-delete-movements' as const, message: 'Selecciona al menos un movimiento.' });

		try {
			for (const id of ids) await movementService.deleteMovement(id);
			return { action: 'bulk-delete-movements' as const, success: 'Movimientos eliminados.' };
		} catch (error) {
			if (error instanceof MovementValidationError) return fail(400, { action: 'bulk-delete-movements' as const, errors: error.errors, message: 'No se pudieron eliminar todos los movimientos.' });
			if (error instanceof MovementNotFoundError) return fail(400, { action: 'bulk-delete-movements' as const, message: error.message });
			throw error;
		}
	}
};

function toExpense(expense: RecurringExpense, categories: Category[]): Expense {
	const category = categories.find((item) => item.id === expense.categoryId);
	return {
		id: expense.id,
		name: expense.name,
		classification: 'obligations',
		frequency: expense.frequency as ExpenseFrequency,
		customIntervalCount: expense.customIntervalCount,
		customIntervalUnit: expense.customIntervalUnit,
		amountKind: expense.amountKind as ExpenseAmountKind,
		amount: expense.amountCents,
		currencyCode: 'MXN',
		statementDay: expense.statementDay,
		paymentDueDay: null,
		categoryId: expense.categoryId,
		categoryName: category?.name ?? expense.category?.name ?? 'Sin categoría',
		categoryColor: (category?.color ?? expense.category?.color ?? '#123a63') as CardColor,
		active: expense.isActive,
		registeredAt: expense.createdAt,
		updatedAt: expense.updatedAt,
		deletedAt: null,
		amountHistory: [],
		paymentHistory: []
	};
}

function toMovement(
	movement: MovementOutput,
	accounts: Account[],
	categories: Category[],
	recurringExpenses: RecurringExpense[],
	recurringIncomes: RecurringIncome[],
	loans: Awaited<ReturnType<typeof loanService.getLoans>>
): Movement {
	const source = movement.sourceAccountId ? accounts.find((account) => account.id === movement.sourceAccountId) ?? null : null;
	const destination = movement.destinationAccountId ? accounts.find((account) => account.id === movement.destinationAccountId) ?? null : null;
	const category = movement.categoryId ? categories.find((item) => item.id === movement.categoryId) ?? null : null;
	const recurringExpense = movement.recurringExpenseId ? recurringExpenses.find((expense) => expense.id === movement.recurringExpenseId) ?? null : null;
	const recurringIncome = movement.recurringIncomeId ? recurringIncomes.find((income) => income.id === movement.recurringIncomeId) ?? null : null;
	const loan = movement.loanId ? loans.find((item) => item.id === movement.loanId) ?? null : null;

	return {
		id: movement.id,
		type: movement.type,
		title: movement.title,
		reason: movement.description,
		amount: movement.amountCents,
		currencyCode: movement.currencyCode,
		paymentMode: null,
		installmentCount: null,
		interestFree: false,
		occurredAt: movement.occurredAt,
		sourceCardId: movement.sourceAccountId,
		sourceCardAlias: source ? source.type === 'personal' ? 'Efectivo' : source.name : null,
		sourceCardLastFourDigits: source?.cardLastFourDigits ?? null,
		sourceCardKind: source?.type === 'credit' ? 'credit' : source ? 'debit' : null,
		destinationCardId: movement.destinationAccountId,
		destinationCardAlias: destination ? destination.type === 'personal' ? 'Efectivo' : destination.name : null,
		destinationCardLastFourDigits: destination?.cardLastFourDigits ?? null,
		destinationCardKind: destination?.type === 'credit' ? 'credit' : destination ? 'debit' : null,
		classificationKind: movement.recurringIncomeId ? 'income' : movement.recurringExpenseId ? 'expense' : movement.categoryId ? 'category' : null,
		classificationId: movement.recurringIncomeId ?? movement.recurringExpenseId ?? movement.categoryId,
		classificationName: recurringIncome?.title ?? recurringExpense?.name ?? (category ? getCategoryPath(category, categories) : null),
		loanId: movement.loanId,
		loanName: loan?.name ?? null,
		active: movement.active,
		registeredAt: movement.createdAt,
		updatedAt: movement.updatedAt,
		deletedAt: movement.deletedAt
	};
}
