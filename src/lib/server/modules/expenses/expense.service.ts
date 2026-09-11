import type { Expense } from '$lib/modules/expenses/types/expense.types';
import { normalizeCategoryColor } from '$lib/modules/categories/utils/category-color';
import {
	findActiveCategoryById,
	listActiveCategoryRecords
} from '$lib/server/modules/categories/category.repository';
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

function effectiveCategoryColor(
	categoryId: string,
	categories: { id: string; parentId: string | null; color: string }[]
) {
	const recordsById = new Map(categories.map((category) => [category.id, category]));
	let current = recordsById.get(categoryId);
	let color = current?.color ?? '#64748b';
	let guard = 0;

	while (current?.parentId && guard < categories.length) {
		const parent = recordsById.get(current.parentId);
		if (!parent) break;
		color = parent.color;
		current = parent;
		guard += 1;
	}

	return normalizeCategoryColor(color);
}

export async function getExpenses(): Promise<Expense[]> {
	const [records, categories] = await Promise.all([
		listActiveExpensesWithCategory(),
		listActiveCategoryRecords()
	]);
	const changes = await listAmountChangesByExpenseIds(records.map((record) => record.id));
	const payments = await listPaymentsByExpenseIds(records.map((record) => record.id));
	return records.map((record) =>
		toExpense(
			{
				...record,
				categoryColor: effectiveCategoryColor(record.categoryId, categories)
			},
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
		movementId = await createMovement(
			{
				type: 'expense',
				title: expense.name,
				amount: input.amount,
				paymentMode: 'cash',
				occurredAt: input.paidAt,
				sourceCardId: input.cardId ?? '',
				classificationKind: 'expense',
				classificationId: expense.id
			},
			{ registerExpensePayment: false }
		);
	}

	await insertExpensePayment({
		...input,
		currencyCode: expense.currencyCode,
		movementId
	});
}
