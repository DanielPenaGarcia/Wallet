import type { Expense } from '$lib/modules/expenses/types/expense.types';
import { findActiveCategoryById } from '$lib/server/modules/categories/category.repository';
import { ActiveCategoryNotFoundError, ExpenseNotFoundError } from './expense.errors';
import { toExpense } from './expense.mapper';
import {
	findActiveExpenseById,
	insertExpense,
	insertExpensePayment,
	listActiveExpensesWithCategory,
	listAmountChangesByExpenseIds,
	listPaymentsByExpenseIds,
	softDeleteExpenseRecord,
	updateExpenseRecord
} from './expense.repository';
import type { CreateExpenseInput } from './inputs/create-expense.input';
import type { PayExpenseInput } from './inputs/pay-expense.input';
import type { UpdateExpenseInput } from './inputs/update-expense.input';
import { createMovement } from '$lib/server/modules/movements/movement.service';

function normalizeExpenseInterval<T extends CreateExpenseInput>(input: T): T {
	if (input.frequency === 'custom') return input;
	return { ...input, customIntervalCount: null, customIntervalUnit: null };
}

export async function getExpenses(): Promise<Expense[]> {
	const records = await listActiveExpensesWithCategory();
	const changes = await listAmountChangesByExpenseIds(records.map((record) => record.id));
	const payments = await listPaymentsByExpenseIds(records.map((record) => record.id));
	return records.map((record) =>
		toExpense(
			record,
			changes
				.filter((change) => change.expenseId === record.id)
				.map(({ expenseId: _expenseId, ...change }) => change),
			payments.filter((payment) => payment.expenseId === record.id)
		)
	);
}

export async function createExpense(input: CreateExpenseInput): Promise<void> {
	if (!(await findActiveCategoryById(input.categoryId))) throw new ActiveCategoryNotFoundError();
	await insertExpense(normalizeExpenseInterval(input));
}

export async function updateExpense(input: UpdateExpenseInput): Promise<void> {
	if (!(await findActiveCategoryById(input.categoryId))) throw new ActiveCategoryNotFoundError();
	const expense = await findActiveExpenseById(input.id);
	if (!expense) throw new ExpenseNotFoundError();
	await updateExpenseRecord(normalizeExpenseInterval(input), expense.amount);
}

export async function deleteExpense(id: string): Promise<void> {
	if (!(await findActiveExpenseById(id))) throw new ExpenseNotFoundError();
	await softDeleteExpenseRecord(id);
}

export async function payExpense(input: PayExpenseInput): Promise<void> {
	const expense = await findActiveExpenseById(input.expenseId);
	if (!expense) throw new ExpenseNotFoundError();

	let movementId: string | null = null;
	if (input.mode === 'card') {
		movementId = await createMovement({
			type: 'expense',
			title: expense.name,
			amount: input.amount,
			paymentMode: 'cash',
			occurredAt: input.paidAt,
			sourceCardId: input.cardId ?? '',
			classificationKind: 'expense',
			classificationId: expense.id
		});
	}

	await insertExpensePayment({
		...input,
		currencyCode: expense.currencyCode,
		movementId
	});
}
