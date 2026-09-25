import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { getCategoryPath } from '$lib/modules/expenses/utils/category-path';
import { toCardListItem } from '$lib/modules/accounts/utils/account-card-list-item';
import { buildColorPaletteCssVariables, toColorPaletteCssVariables } from '$lib/shared/utils/color-palette';
import { colorInputToHex } from '$lib/shared/utils/color';
import type { Account } from '$lib/modules/accounts/types/account.types';
import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';
import type { CreditCardProjection, CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import type { DashboardSummary } from '$lib/modules/dashboard/types/dashboard-summary.types';
import type { Expense, ExpenseAmountKind, ExpenseFrequency, ExpenseIntervalUnit } from '$lib/modules/expenses/types/expense.types';
import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
import type { Loan, LoanInstallment, LoanSummary } from '$lib/modules/loans/types/loan.types';
import type { Movement, MovementClassificationKind, MovementType } from '$lib/modules/movements/types/movement.types';
import type { NextIncomePlanning, PlanningObligation } from '$lib/modules/planning/types/next-income-planning.types';
import type { RecurringExpense, RecurringExpensePaymentSchedule } from '$lib/modules/recurring-expenses/types/recurring-expense.types';
import type { IncomeFrequency, IncomeSource, PaymentSchedule, RecurringIncome, WorkSchedule } from '$lib/modules/recurring-incomes/types/recurring-income.types';

const dbName = 'wallet-local-finance';
const dbVersion = 1;
const backupVersion = 1;
const allStores = [
	'banks',
	'categories',
	'colorPalettes',
	'accounts',
	'movements',
	'recurringExpenses',
	'recurringIncomes',
	'financialGoals',
	'loans',
	'installmentPurchases',
	'creditCardStatements'
] as const;

type StoreName = (typeof allStores)[number];
type StoredMovement = {
	id: string;
	type: MovementType;
	title: string;
	description: string | null;
	amountCents: number;
	currencyCode: string;
	paymentMode: Movement['paymentMode'];
	installmentCount: number | null;
	interestFree: boolean;
	occurredAt: string;
	sourceAccountId: string | null;
	destinationAccountId: string | null;
	categoryId: string | null;
	recurringExpenseId: string | null;
	recurringIncomeId: string | null;
	loanId: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

type LocalSnapshot = {
	banks: Bank[];
	categories: Category[];
	colorPalettes: ColorPalette[];
	accounts: Account[];
	movements: StoredMovement[];
	recurringExpenses: RecurringExpense[];
	recurringIncomes: RecurringIncome[];
	financialGoals: FinancialGoal[];
	loans: Loan[];
	installmentPurchases: InstallmentPurchase[];
	creditCardStatements: CreditCardStatement[];
};

type BackupFile = {
	version: typeof backupVersion;
	exportedAt: string;
	source: 'wallet-local-indexeddb' | 'wallet-sqlite-export';
	data: LocalSnapshot;
};

export type LocalFormFeedback = {
	action: string;
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: Record<string, unknown>;
};

export const localFormFeedback = writable<LocalFormFeedback | null>(null);

const emptySnapshot = (): LocalSnapshot => ({
	banks: [],
	categories: [],
	colorPalettes: [],
	accounts: [],
	movements: [],
	recurringExpenses: [],
	recurringIncomes: [],
	financialGoals: [],
	loans: [],
	installmentPurchases: [],
	creditCardStatements: []
});

const defaultColorPalettes: ColorPalette[] = [
	{
		id: 'color-palette-black-white',
		name: 'Noir absolutista',
		primary: '#000000',
		secondary: '#404040',
		tertiary: '#737373',
		background: '#ffffff',
		surface: '#f5f5f5',
		isDefault: true,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	},
	{
		id: 'color-palette-elegante-cacao',
		name: 'Elegante cacao',
		primary: '#4A1C0A',
		secondary: '#EBD5B0',
		tertiary: '#8A5A3B',
		background: '#FFF8EC',
		surface: '#F3E2C4',
		isDefault: false,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	},
	{
		id: 'color-palette-fancy-menta',
		name: 'Fancy menta',
		primary: '#1C2B3A',
		secondary: '#A8D8C8',
		tertiary: '#5F9E8E',
		background: '#F4FAF8',
		surface: '#DDEFE9',
		isDefault: false,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	},
	{
		id: 'color-palette-dorado-editorial',
		name: 'Dorado editorial',
		primary: '#F5C842',
		secondary: '#2A1505',
		tertiary: '#8A5A16',
		background: '#FFF8E3',
		surface: '#FBE9A7',
		isDefault: false,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	},
	{
		id: 'color-palette-azul-ejecutivo',
		name: 'Azul ejecutivo',
		primary: '#0D1B4B',
		secondary: '#A8D8EA',
		tertiary: '#4D6DAE',
		background: '#F4FAFD',
		surface: '#DCEFF7',
		isDefault: false,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	},
	{
		id: 'color-palette-coral-botanico',
		name: 'Coral botánico',
		primary: '#59B292',
		secondary: '#FA6781',
		tertiary: '#FAE7CB',
		background: '#FFF8EE',
		surface: '#E5F3ED',
		isDefault: false,
		createdAt: '2026-09-24T00:00:00.000Z',
		updatedAt: '2026-09-24T00:00:00.000Z'
	}
];

const defaultPalette = defaultColorPalettes[0];

function now() {
	return new Date().toISOString();
}

function id(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function amountCents(value: FormDataEntryValue | null) {
	const parsed = Number(typeof value === 'string' ? value : '');
	return Number.isFinite(parsed) ? Math.round(parsed * 100) : Number.NaN;
}

function text(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function bool(formData: FormData, field: string) {
	const value = formData.get(field);
	return value === 'on' || value === 'true';
}

function optionalId(value: string) {
	return value.trim() === '' || value === 'none' || value === 'all' ? null : value.trim();
}

function monthDay(value: string): number | 'last' | null {
	if (value === 'last') return 'last';
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31 ? parsed : null;
}

function dateTime(value: string) {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? new Date(parsed).toISOString() : now();
}

function dbRequest<T>(request: IDBRequest<T>) {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function transactionDone(transaction: IDBTransaction) {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onabort = () => reject(transaction.error);
		transaction.onerror = () => reject(transaction.error);
	});
}

async function openDb() {
	if (!browser) throw new Error('IndexedDB solo está disponible en el cliente.');

	const database = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion);
		request.onupgradeneeded = () => {
			for (const store of allStores) {
				if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store, { keyPath: 'id' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

	await seed(database);
	return database;
}

async function seed(database: IDBDatabase) {
	const transaction = database.transaction(['colorPalettes', 'accounts'], 'readwrite');
	const palettes = transaction.objectStore('colorPalettes');
	const accounts = transaction.objectStore('accounts');
	const existingPalettes = await dbRequest(palettes.getAll()) as ColorPalette[];
	const hasDefaultPalette = existingPalettes.some((palette) => palette.isDefault);
	for (const palette of defaultColorPalettes) {
		if (await dbRequest(palettes.get(palette.id))) continue;
		palettes.put({
			...palette,
			isDefault: palette.isDefault && !hasDefaultPalette
		});
	}
	if (!(await dbRequest(accounts.get('personal')))) {
		accounts.put({
			id: 'personal',
			name: 'Efectivo',
			type: 'personal',
			bankId: null,
			bank: null,
			cardLastFourDigits: null,
			cardColor: '#0f766e',
			balanceCents: 0,
			balanceAsOfDate: new Date().toISOString().slice(0, 10),
			creditLimitCents: null,
			statementDay: null,
			paymentDueDay: null,
			isActive: true,
			createdAt: now(),
			updatedAt: now(),
			adjustments: []
		} satisfies Account);
	}
	await transactionDone(transaction);
}

async function readStore<T>(database: IDBDatabase, store: StoreName): Promise<T[]> {
	const transaction = database.transaction(store, 'readonly');
	return dbRequest(transaction.objectStore(store).getAll()) as Promise<T[]>;
}

async function snapshot(database?: IDBDatabase): Promise<LocalSnapshot> {
	const activeDatabase = database ?? await openDb();
	const [
		banks,
		categories,
		colorPalettes,
		accounts,
		movements,
		recurringExpenses,
		recurringIncomes,
		financialGoals,
		loans,
		installmentPurchases,
		creditCardStatements
	] = await Promise.all([
		readStore<Bank>(activeDatabase, 'banks'),
		readStore<Category>(activeDatabase, 'categories'),
		readStore<ColorPalette>(activeDatabase, 'colorPalettes'),
		readStore<Account>(activeDatabase, 'accounts'),
		readStore<StoredMovement>(activeDatabase, 'movements'),
		readStore<RecurringExpense>(activeDatabase, 'recurringExpenses'),
		readStore<RecurringIncome>(activeDatabase, 'recurringIncomes'),
		readStore<FinancialGoal>(activeDatabase, 'financialGoals'),
		readStore<Loan>(activeDatabase, 'loans'),
		readStore<InstallmentPurchase>(activeDatabase, 'installmentPurchases'),
		readStore<CreditCardStatement>(activeDatabase, 'creditCardStatements')
	]);
	return {
		banks,
		categories,
		colorPalettes,
		accounts: hydrateAccounts(accounts, banks),
		movements,
		recurringExpenses: hydrateRecurringExpenses(recurringExpenses, categories, accounts),
		recurringIncomes,
		financialGoals,
		loans,
		installmentPurchases,
		creditCardStatements
	};
}

function hydrateAccounts(accounts: Account[], banks: Bank[]) {
	return accounts
		.map((account) => ({ ...account, bank: banks.find((bank) => bank.id === account.bankId) ?? null }))
		.sort((first, second) => Number(first.type === 'credit') - Number(second.type === 'credit') || first.name.localeCompare(second.name));
}

function hydrateRecurringExpenses(expenses: RecurringExpense[], categories: Category[], accounts: Account[]) {
	return expenses.map((expense) => {
		const category = categories.find((item) => item.id === expense.categoryId) ?? null;
		const account = accounts.find((item) => item.id === expense.paymentAccountId) ?? null;
		return {
			...expense,
			category: category ? { id: category.id, name: category.name, color: category.color, isEssential: category.isEssential } : null,
			paymentAccount: account
				? {
						id: account.id,
						name: account.name,
						type: account.type,
						bank: account.bank,
						cardLastFourDigits: account.cardLastFourDigits,
						cardColor: account.cardColor,
						isActive: account.isActive
					}
				: null,
			nextOccurrenceAt: expense.nextOccurrenceAt ?? null
		};
	});
}

function buildCategoryTree(categories: Category[]): CategoryNode[] {
	const nodes = new Map(categories.map((category) => [category.id, { ...category, children: [] as CategoryNode[] }]));
	const roots: CategoryNode[] = [];
	for (const node of nodes.values()) {
		if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId)?.children.push(node);
		else roots.push(node);
	}
	return roots;
}

function movementToUi(movement: StoredMovement, data: LocalSnapshot): Movement {
	const source = data.accounts.find((account) => account.id === movement.sourceAccountId);
	const destination = data.accounts.find((account) => account.id === movement.destinationAccountId);
	const category = data.categories.find((item) => item.id === movement.categoryId);
	const recurringExpense = data.recurringExpenses.find((item) => item.id === movement.recurringExpenseId);
	const recurringIncome = data.recurringIncomes.find((item) => item.id === movement.recurringIncomeId);
	const loan = data.loans.find((item) => item.id === movement.loanId);
	const classificationKind: MovementClassificationKind | null = movement.recurringIncomeId
		? 'income'
		: movement.recurringExpenseId
			? 'expense'
			: movement.categoryId
				? 'category'
				: null;
	return {
		id: movement.id,
		type: movement.type,
		title: movement.title,
		reason: movement.description,
		amount: movement.amountCents,
		currencyCode: movement.currencyCode,
		paymentMode: movement.paymentMode,
		installmentCount: movement.installmentCount,
		interestFree: movement.interestFree,
		occurredAt: movement.occurredAt,
		sourceCardId: movement.sourceAccountId,
		sourceCardAlias: source?.name ?? null,
		sourceCardLastFourDigits: source?.cardLastFourDigits ?? null,
		sourceCardKind: source?.type === 'credit' ? 'credit' : source ? 'debit' : null,
		destinationCardId: movement.destinationAccountId,
		destinationCardAlias: destination?.name ?? null,
		destinationCardLastFourDigits: destination?.cardLastFourDigits ?? null,
		destinationCardKind: destination?.type === 'credit' ? 'credit' : destination ? 'debit' : null,
		classificationKind,
		classificationId: movement.recurringIncomeId ?? movement.recurringExpenseId ?? movement.categoryId,
		classificationName: recurringIncome?.title ?? recurringExpense?.name ?? (category ? getCategoryPath(category, data.categories) : null),
		loanId: movement.loanId,
		loanName: loan?.name ?? null,
		active: movement.active,
		registeredAt: movement.createdAt,
		updatedAt: movement.updatedAt,
		deletedAt: movement.deletedAt
	};
}

function recurringExpenseToExpense(expense: RecurringExpense, categories: Category[]): Expense {
	const category = categories.find((item) => item.id === expense.categoryId);
	return {
		id: expense.id,
		name: expense.name,
		classification: 'obligations',
		frequency: expense.frequency as ExpenseFrequency,
		customIntervalCount: expense.customIntervalCount,
		customIntervalUnit: expense.customIntervalUnit,
		amountKind: expense.amountKind,
		amount: expense.amountCents,
		currencyCode: 'MXN',
		statementDay: expense.statementDay,
		paymentDueDay: null,
		categoryId: expense.categoryId,
		categoryName: category?.name ?? expense.category?.name ?? 'Sin categoria',
		categoryColor: category?.color ?? expense.category?.color ?? '#64748b',
		active: expense.isActive,
		registeredAt: expense.createdAt,
		updatedAt: expense.updatedAt,
		deletedAt: null,
		amountHistory: [],
		paymentHistory: []
	};
}

function loanSummary(loan: Loan, movements: StoredMovement[]): LoanSummary {
	const paidAmountCents = movements
		.filter((movement) => movement.active && movement.loanId === loan.id && ['loan_payment', 'loan_collection'].includes(movement.type))
		.reduce((sum, movement) => sum + movement.amountCents, 0);
	const outstandingAmountCents = Math.max(0, loan.totalRepaymentCents - paidAmountCents);
	const installmentAmount = Math.round(loan.totalRepaymentCents / Math.max(1, loan.installmentCount));
	const installments: LoanInstallment[] = Array.from({ length: loan.installmentCount }, (_, index) => {
		const coveredAmountCents = Math.min(Math.max(0, paidAmountCents - index * installmentAmount), installmentAmount);
		const dueDate = new Date(`${loan.firstPaymentDate}T00:00:00`);
		dueDate.setMonth(dueDate.getMonth() + index);
		return {
			number: index + 1,
			dueDate: dueDate.toISOString().slice(0, 10),
			amountCents: installmentAmount,
			coveredAmountCents,
			remainingAmountCents: Math.max(0, installmentAmount - coveredAmountCents),
			status: coveredAmountCents === 0 ? 'pending' : coveredAmountCents >= installmentAmount ? 'paid' : 'partial'
		};
	});
	return {
		...loan,
		financingCostCents: loan.totalRepaymentCents - loan.principalAmountCents,
		paidAmountCents,
		outstandingAmountCents,
		progressPercentage: loan.totalRepaymentCents > 0 ? Math.round((paidAmountCents / loan.totalRepaymentCents) * 100) : 0,
		nextInstallment: installments.find((installment) => installment.status !== 'paid') ?? null,
		installments
	};
}

function dashboard(data: LocalSnapshot): DashboardSummary {
	const activeMovements = data.movements.filter((movement) => movement.active);
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	const monthEnd = new Date(monthStart);
	monthEnd.setMonth(monthEnd.getMonth() + 1);
	monthEnd.setMilliseconds(-1);
	const thisMonth = activeMovements.filter((movement) => {
		const time = Date.parse(movement.occurredAt);
		return time >= monthStart.getTime() && time <= monthEnd.getTime();
	});
	const loans = data.loans.map((loan) => loanSummary(loan, data.movements));
	return {
		currencyCode: 'MXN',
		current: {
			availableMoneyCents: data.accounts.filter((account) => account.type !== 'credit').reduce((sum, account) => sum + account.balanceCents, 0),
			consumedCreditCents: data.accounts.filter((account) => account.type === 'credit').reduce((sum, account) => sum + account.balanceCents, 0),
			realMoneyAccountCount: data.accounts.filter((account) => account.type !== 'credit').length,
			creditAccountCount: data.accounts.filter((account) => account.type === 'credit').length
		},
		monthlyActivity: {
			monthStartsOn: monthStart.toISOString().slice(0, 10),
			monthEndsOn: monthEnd.toISOString().slice(0, 10),
			incomeCents: thisMonth.filter((movement) => movement.type === 'income').reduce((sum, movement) => sum + movement.amountCents, 0),
			paidExpenseCents: thisMonth.filter((movement) => movement.type === 'expense').reduce((sum, movement) => sum + movement.amountCents, 0),
			creditPurchaseCents: thisMonth.filter((movement) => movement.type === 'credit_purchase').reduce((sum, movement) => sum + movement.amountCents, 0),
			creditCardPaymentCents: thisMonth.filter((movement) => movement.type === 'credit_card_payment').reduce((sum, movement) => sum + movement.amountCents, 0)
		},
		upcomingIncome: data.recurringIncomes.find((income) => income.isActive)
			? {
					id: data.recurringIncomes.find((income) => income.isActive)!.id,
					title: data.recurringIncomes.find((income) => income.isActive)!.title,
					expectedAmountCents: data.recurringIncomes.find((income) => income.isActive)!.expectedAmountCents,
					date: new Date().toISOString().slice(0, 10)
				}
			: null,
		upcomingExpenses: data.recurringExpenses.filter((expense) => expense.isActive).map((expense) => ({
			id: expense.id,
			name: expense.name,
			categoryName: expense.category?.name ?? 'Sin categoria',
			categoryColor: expense.category?.color ?? '#64748b',
			amountCents: expense.amountCents,
			amountKind: expense.amountKind,
			date: expense.nextOccurrenceAt ?? new Date().toISOString().slice(0, 10)
		})),
		creditCards: data.accounts.filter((account) => account.type === 'credit').map((account) => ({
			accountId: account.id,
			name: account.name,
			bankName: account.bank?.name ?? 'Sin banco',
			cardLastFourDigits: account.cardLastFourDigits,
			cardColor: account.cardColor,
			consumedBalanceCents: account.balanceCents,
			availableCreditCents: Math.max(0, (account.creditLimitCents ?? 0) - account.balanceCents),
			creditLimitCents: account.creditLimitCents ?? 0,
			statementOutstandingCents: Math.max(0, account.balanceCents),
			paymentDueDate: null,
			isActive: account.isActive
		})),
		loans: {
			borrowedOutstandingCents: loans.filter((loan) => loan.direction === 'borrowed').reduce((sum, loan) => sum + loan.outstandingAmountCents, 0),
			lentOutstandingCents: loans.filter((loan) => loan.direction === 'lent').reduce((sum, loan) => sum + loan.outstandingAmountCents, 0),
			nextBorrowedInstallment: null,
			nextLentInstallment: null
		},
		goals: data.financialGoals.map((goal) => ({
			id: goal.id,
			name: goal.name,
			targetAmountCents: goal.targetAmountCents,
			currentAmountCents: goal.currentAmountCents,
			remainingAmountCents: Math.max(0, goal.targetAmountCents - goal.currentAmountCents),
			progressPercentage: goal.targetAmountCents > 0 ? Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100) : 0,
			distributionPercentage: goal.distributionPercentage,
			estimatedNextContributionCents: null,
			estimatedContributionDate: null
		})),
		recentMovements: activeMovements.slice(0, 8).map((movement) => ({
			id: movement.id,
			type: movement.type,
			title: movement.title,
			amountCents: movement.amountCents,
			currencyCode: movement.currencyCode,
			occurredAt: movement.occurredAt,
			accountLabel: data.accounts.find((account) => account.id === movement.sourceAccountId || account.id === movement.destinationAccountId)?.name ?? null
		}))
	};
}

function planning(data: LocalSnapshot): NextIncomePlanning {
	const summary = dashboard(data);
	const obligations: PlanningObligation[] = data.recurringExpenses.filter((expense) => expense.isActive).map((expense) => ({
		id: expense.id,
		kind: expense.paymentAccount?.type === 'credit' ? 'recurring_expense_credit' : expense.paymentAccount?.type === 'debit' ? 'recurring_expense_debit' : 'recurring_expense_unassigned',
		impact: expense.paymentAccount?.type === 'credit' ? 'credit_consumption' : expense.paymentAccount ? 'cash_need' : 'requires_attention',
		title: expense.name,
		date: expense.nextOccurrenceAt ?? new Date().toISOString().slice(0, 10),
		amountCents: expense.amountCents,
		accountId: expense.paymentAccountId,
		accountName: expense.paymentAccount?.name ?? null,
		accountType: expense.paymentAccount?.type ?? null,
		coveredByExistingMoneyCents: 0,
		reservedFromNextIncomeCents: 0,
		coveredAmountCents: 0,
		uncoveredAmountCents: expense.amountCents
	}));
	const nextIncome = data.recurringIncomes.find((income) => income.isActive);
	const totalCashObligationsCents = obligations.filter((item) => item.impact === 'cash_need').reduce((sum, item) => sum + item.amountCents, 0);
	const incomeCents = nextIncome?.expectedAmountCents ?? 0;
	return {
		currencyCode: 'MXN',
		generatedAt: now(),
		period: { startDate: null, endDate: null, hasFollowingIncome: false },
		nextIncome: nextIncome ? { date: new Date().toISOString().slice(0, 10), amountCents: incomeCents, titles: [nextIncome.title] } : null,
		existingRealMoneyCents: summary.current.availableMoneyCents,
		totalCashAvailableCents: summary.current.availableMoneyCents + incomeCents,
		cashObligations: obligations.filter((item) => item.impact === 'cash_need'),
		creditConsumptions: obligations.filter((item) => item.impact === 'credit_consumption'),
		statementPayments: [],
		unassignedRecurringExpenses: obligations.filter((item) => item.impact === 'requires_attention'),
		totalCashObligationsCents,
		totalCreditConsumptionCents: obligations.filter((item) => item.impact === 'credit_consumption').reduce((sum, item) => sum + item.amountCents, 0),
		totalStatementPaymentsCents: 0,
		existingMoneyUsedForObligationsCents: Math.min(summary.current.availableMoneyCents, totalCashObligationsCents),
		nextIncomeReservedForObligationsCents: Math.max(0, totalCashObligationsCents - summary.current.availableMoneyCents),
		nextIncomeAvailableForGoalsCents: Math.max(0, incomeCents - Math.max(0, totalCashObligationsCents - summary.current.availableMoneyCents)),
		recommendedGoalAllocationCents: 0,
		remainingNextIncomeCents: Math.max(0, incomeCents - totalCashObligationsCents),
		coveredCashObligationsCents: Math.min(summary.current.availableMoneyCents + incomeCents, totalCashObligationsCents),
		uncoveredCashObligationsCents: Math.max(0, totalCashObligationsCents - summary.current.availableMoneyCents - incomeCents),
		freeCashCents: Math.max(0, summary.current.availableMoneyCents + incomeCents - totalCashObligationsCents),
		goalAllocations: data.financialGoals.map((goal) => ({ goalId: goal.id, name: goal.name, distributionPercentage: goal.distributionPercentage, allocatedAmountCents: 0, remainingAmountCents: Math.max(0, goal.targetAmountCents - goal.currentAmountCents) })),
		remainingFreeCashCents: Math.max(0, summary.current.availableMoneyCents + incomeCents - totalCashObligationsCents),
		alerts: browser ? [] : ['La planificacion se calcula localmente al abrir la app.']
	};
}

export async function loadLayoutData() {
	const data = await snapshot();
	const palettes = data.colorPalettes.length > 0 ? data.colorPalettes : [defaultPalette];
	const defaultColorPalette = palettes.find((palette) => palette.isDefault) ?? palettes[0];
	return {
		defaultColorPaletteId: defaultColorPalette.id,
		defaultColorPaletteCssVariables: toColorPaletteCssVariables(buildColorPaletteCssVariables(defaultColorPalette)),
		colorPaletteCssVariables: palettes.map((palette) => ({
			id: palette.id,
			isDefault: palette.isDefault,
			cssVariables: toColorPaletteCssVariables(buildColorPaletteCssVariables(palette))
		}))
	};
}

export async function loadDashboardPage() {
	return { summary: dashboard(await snapshot()) };
}

export async function loadAccountsPage() {
	const data = await snapshot();
	return { accounts: data.accounts, banks: data.banks };
}

export async function loadMovementsPage(url: URL) {
	const data = await snapshot();
	const filters = {
		startDate: url.searchParams.get('startDate') ?? '',
		endDate: url.searchParams.get('endDate') ?? '',
		cardId: optionalId(url.searchParams.get('cardId') ?? '') ?? '',
		categoryId: optionalId(url.searchParams.get('categoryId') ?? '') ?? '',
		type: optionalId(url.searchParams.get('type') ?? '') ?? ''
	};
	const movements = data.movements
		.filter((movement) => movement.active)
		.filter((movement) => !filters.cardId || movement.sourceAccountId === filters.cardId || movement.destinationAccountId === filters.cardId)
		.filter((movement) => !filters.categoryId || movement.categoryId === filters.categoryId)
		.filter((movement) => !filters.type || movement.type === filters.type)
		.filter((movement) => !filters.startDate || movement.occurredAt >= `${filters.startDate}T00:00:00.000Z`)
		.filter((movement) => !filters.endDate || movement.occurredAt <= `${filters.endDate}T23:59:59.999Z`)
		.sort((first, second) => second.occurredAt.localeCompare(first.occurredAt))
		.map((movement) => movementToUi(movement, data));
	return {
		movements,
		cards: data.accounts.map(toCardListItem),
		expenses: data.recurringExpenses.map((expense) => recurringExpenseToExpense(expense, data.categories)),
		incomes: data.recurringIncomes,
		categories: data.categories,
		filters
	};
}

export async function loadSettingsPage() {
	const data = await snapshot();
	const selected = data.colorPalettes.find((palette) => palette.isDefault) ?? data.colorPalettes[0] ?? defaultPalette;
	return {
		banks: data.banks,
		categories: data.categories,
		categoryTree: buildCategoryTree(data.categories),
		colorPalettes: data.colorPalettes.length > 0 ? data.colorPalettes : [defaultPalette],
		selectedColorPaletteId: selected.id
	};
}

export async function loadRecurringPage() {
	const data = await snapshot();
	return {
		recurringExpenses: data.recurringExpenses,
		recurringIncomes: data.recurringIncomes,
		categories: data.categories,
		paymentAccounts: data.accounts.filter((account) => account.isActive && (account.type === 'debit' || account.type === 'credit')).map(toCardListItem)
	};
}

export async function loadGoalsPage() {
	const data = await snapshot();
	return {
		goals: data.financialGoals,
		planningPeriods: []
	};
}

export async function loadLoansPage() {
	const data = await snapshot();
	return {
		loans: data.loans.map((loan) => loanSummary(loan, data.movements)),
		cards: data.accounts.map(toCardListItem)
	};
}

export async function loadLoanDetailPage(loanId: string) {
	const data = await snapshot();
	const loan = data.loans.find((item) => item.id === loanId);
	if (!loan) return { loan: loanSummary({ id: loanId, name: 'Prestamo no encontrado', direction: 'borrowed', counterpartyName: '', principalAmountCents: 0, totalRepaymentCents: 0, installmentCount: 1, firstPaymentDate: new Date().toISOString().slice(0, 10), currencyCode: 'MXN', status: 'cancelled', createdAt: now(), updatedAt: now(), cancelledAt: now() }, []), cards: data.accounts.map(toCardListItem), movements: [] };
	return {
		loan: loanSummary(loan, data.movements),
		cards: data.accounts.map(toCardListItem),
		movements: data.movements.filter((movement) => movement.loanId === loan.id).map((movement) => ({
			id: movement.id,
			type: movement.type,
			title: movement.title,
			amountCents: movement.amountCents,
			currencyCode: movement.currencyCode,
			occurredAt: movement.occurredAt,
			accountLabel: data.accounts.find((account) => account.id === movement.sourceAccountId || account.id === movement.destinationAccountId)?.name ?? null
		}))
	};
}

function emptyProjection(account: Account, latestStatement: CreditCardStatement | null): CreditCardProjection {
	return {
		cycle: {
			previousStatementDate: new Date().toISOString().slice(0, 10),
			previousPeriodStart: new Date().toISOString().slice(0, 10),
			previousPeriodEnd: new Date().toISOString().slice(0, 10),
			currentPeriodStart: new Date().toISOString().slice(0, 10),
			currentPeriodEnd: new Date().toISOString().slice(0, 10),
			nextStatementDate: new Date().toISOString().slice(0, 10)
		},
		latestStatement,
		latestStatementStatus: latestStatement ? (latestStatement.paidAmountCents >= latestStatement.statementBalanceCents ? 'paid' : latestStatement.paidAmountCents > 0 ? 'partial' : 'pending') : null,
		outstandingPreviousStatementCents: latestStatement ? Math.max(0, latestStatement.statementBalanceCents - latestStatement.paidAmountCents) : 0,
		futureInstallmentBalanceCents: 0,
		nextInstallmentsCents: 0,
		estimatedUnbilledNonInstallmentCents: account.balanceCents,
		presentationUnbilledNonInstallmentCents: account.balanceCents,
		estimatedNewStatementChargesCents: account.balanceCents,
		estimatedNextStatementBaseCents: account.balanceCents,
		hasBalanceCompositionInconsistency: false
	};
}

export async function loadAccountDetailPage(accountId: string) {
	const data = await snapshot();
	const account = data.accounts.find((item) => item.id === accountId) ?? data.accounts[0];
	const statementHistory = data.creditCardStatements.filter((statement) => statement.accountId === account?.id).sort((first, second) => second.statementDate.localeCompare(first.statementDate));
	const latestStatement = statementHistory[0] ?? null;
	const today = new Date().toISOString().slice(0, 10);
	return {
		account,
		purchases: data.installmentPurchases.filter((purchase) => purchase.accountId === account?.id),
		latestStatement,
		statementHistory,
		projection: emptyProjection(account, latestStatement),
		statementDraft: { periodStartDate: today, periodEndDate: today, statementDate: today, paymentDueDate: today }
	};
}

export async function loadPlanningPage() {
	return { planning: planning(await snapshot()) };
}

function applyDelta(accounts: Account[], accountId: string | null, delta: number) {
	if (!accountId || delta === 0) return;
	const account = accounts.find((item) => item.id === accountId);
	if (!account) throw new Error('Selecciona una cuenta existente.');
	const nextBalance = account.balanceCents + delta;
	if (nextBalance < 0) throw new Error('El movimiento deja una cuenta con saldo negativo.');
	if (account.type === 'credit' && account.creditLimitCents !== null && nextBalance > account.creditLimitCents) {
		throw new Error('La tarjeta supera el limite de credito.');
	}
	account.balanceCents = nextBalance;
	account.updatedAt = now();
}

function reverseMovement(accounts: Account[], movement: StoredMovement) {
	applyMovement(accounts, movement, -1);
}

function applyMovement(accounts: Account[], movement: Pick<StoredMovement, 'type' | 'amountCents' | 'sourceAccountId' | 'destinationAccountId'>, direction = 1) {
	if (movement.type === 'income' || movement.type === 'loan_received' || movement.type === 'loan_collection') applyDelta(accounts, movement.destinationAccountId, movement.amountCents * direction);
	if (movement.type === 'expense' || movement.type === 'loan_disbursement' || movement.type === 'loan_payment') applyDelta(accounts, movement.sourceAccountId, -movement.amountCents * direction);
	if (movement.type === 'credit_purchase') applyDelta(accounts, movement.sourceAccountId, movement.amountCents * direction);
	if (movement.type === 'transfer') {
		applyDelta(accounts, movement.sourceAccountId, -movement.amountCents * direction);
		applyDelta(accounts, movement.destinationAccountId, movement.amountCents * direction);
	}
	if (movement.type === 'credit_card_payment') {
		applyDelta(accounts, movement.sourceAccountId, -movement.amountCents * direction);
		applyDelta(accounts, movement.destinationAccountId, -movement.amountCents * direction);
	}
	if (movement.type === 'adjustment') {
		if (movement.destinationAccountId) applyDelta(accounts, movement.destinationAccountId, movement.amountCents * direction);
		if (movement.sourceAccountId) applyDelta(accounts, movement.sourceAccountId, -movement.amountCents * direction);
	}
}

function movementFromForm(formData: FormData): StoredMovement {
	const type = text(formData, 'type') as MovementType;
	const classificationKind = text(formData, 'classificationKind') as MovementClassificationKind;
	const classificationId = optionalId(text(formData, 'classificationId'));
	const adjustmentDirection = text(formData, 'adjustmentDirection');
	const adjustmentAccountId = optionalId(text(formData, 'adjustmentAccountId'));
	const movement: StoredMovement = {
		id: text(formData, 'id') || id('movement'),
		type,
		title: text(formData, 'title').trim(),
		description: text(formData, 'reason').trim() || null,
		amountCents: amountCents(formData.get('amount')),
		currencyCode: 'MXN',
		paymentMode: text(formData, 'paymentMode') === 'installments' ? 'installments' : 'cash',
		installmentCount: text(formData, 'installmentCount') ? Number(text(formData, 'installmentCount')) : null,
		interestFree: bool(formData, 'interestFree'),
		occurredAt: dateTime(text(formData, 'occurredAt')),
		sourceAccountId: optionalId(text(formData, 'sourceCardId')),
		destinationAccountId: optionalId(text(formData, 'destinationCardId')),
		categoryId: classificationKind === 'category' ? classificationId : null,
		recurringExpenseId: classificationKind === 'expense' ? classificationId : null,
		recurringIncomeId: optionalId(text(formData, 'recurringIncomeId')),
		loanId: optionalId(text(formData, 'loanId')),
		active: true,
		createdAt: now(),
		updatedAt: now(),
		deletedAt: null
	};
	if (type === 'income') {
		movement.sourceAccountId = null;
		movement.categoryId = null;
		movement.recurringExpenseId = null;
		movement.loanId = null;
	}
	if (['transfer', 'credit_card_payment'].includes(type)) {
		movement.categoryId = null;
		movement.recurringExpenseId = null;
		movement.recurringIncomeId = null;
		movement.loanId = null;
	}
	if (type === 'adjustment') {
		movement.sourceAccountId = adjustmentDirection === 'decrease' ? adjustmentAccountId : null;
		movement.destinationAccountId = adjustmentDirection === 'increase' ? adjustmentAccountId : null;
		movement.categoryId = null;
		movement.recurringExpenseId = null;
		movement.recurringIncomeId = null;
		movement.loanId = null;
	}
	if (!movement.title || !Number.isInteger(movement.amountCents) || movement.amountCents <= 0) {
		throw new Error('Captura concepto, monto y fecha validos.');
	}
	return movement;
}

async function putSnapshot(next: LocalSnapshot) {
	const database = await openDb();
	const transaction = database.transaction([...allStores], 'readwrite');
	for (const storeName of allStores) {
		const store = transaction.objectStore(storeName);
		store.clear();
		for (const row of next[storeName]) store.put(row);
	}
	await transactionDone(transaction);
}

async function mutate(mutator: (data: LocalSnapshot) => Promise<void> | void) {
	const data = await snapshot();
	await mutator(data);
	await putSnapshot(data);
}

function feedbackAction(action: string) {
	const aliases: Record<string, string> = {
		createFinancialGoal: 'create-goal',
		updateFinancialGoal: 'update-goal',
		deleteFinancialGoal: 'delete-goal'
	};
	return aliases[action] ?? action.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function success(action: string, message: string): LocalFormFeedback {
	return { action: feedbackAction(action), success: message };
}

function failure(action: string, error: unknown): LocalFormFeedback {
	return { action: feedbackAction(action), message: error instanceof Error ? error.message : 'No se pudo guardar el cambio local.' };
}

function paymentSchedule(formData: FormData): PaymentSchedule {
	const frequency = text(formData, 'frequency');
	if (frequency === 'daily') return { type: 'daily' };
	if (frequency === 'weekly') return { type: 'weekly', weekday: text(formData, 'weeklyDay') as never };
	if (frequency === 'monthly') return { type: 'monthly', day: monthDay(text(formData, 'monthlyDay')) ?? 30 };
	return { type: 'semimonthly', firstDay: Number(text(formData, 'semimonthlyFirstDay')) || 15, secondDay: monthDay(text(formData, 'semimonthlySecondDay')) ?? 'last' };
}

function expenseSchedule(formData: FormData): RecurringExpensePaymentSchedule {
	const frequency = text(formData, 'frequency');
	if (frequency === 'daily') return { type: 'daily' };
	if (frequency === 'weekly') return { type: 'weekly', weekday: text(formData, 'weeklyDay') as never };
	if (frequency === 'semimonthly') return { type: 'semimonthly', firstDay: Number(text(formData, 'semimonthlyFirstDay')) || 15, secondDay: monthDay(text(formData, 'semimonthlySecondDay')) ?? 'last' };
	if (frequency === 'monthly') return { type: 'monthly', day: monthDay(text(formData, 'monthlyDay')) ?? 1 };
	if (frequency === 'yearly') return { type: 'yearly', month: Number(text(formData, 'yearlyMonth')) || 1, day: monthDay(text(formData, 'yearlyDay')) ?? 1 };
	return { type: 'custom' };
}

async function importBackup(file: File) {
	const parsed = JSON.parse(await file.text()) as BackupFile;
	if (parsed.version !== backupVersion || !parsed.data) throw new Error('El archivo no corresponde a un respaldo compatible de Wallet.');
	await putSnapshot({ ...emptySnapshot(), ...parsed.data });
}

export async function exportBackup() {
	const file: BackupFile = {
		version: backupVersion,
		exportedAt: now(),
		source: 'wallet-local-indexeddb',
		data: await snapshot()
	};
	const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
	const anchor = document.createElement('a');
	anchor.href = URL.createObjectURL(blob);
	anchor.download = `wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
	anchor.click();
	URL.revokeObjectURL(anchor.href);
}

export async function handleLocalForm(actionName: string, formData: FormData): Promise<LocalFormFeedback> {
	try {
		if (actionName === 'exportLocalBackup') {
			await exportBackup();
			return success(actionName, 'Respaldo descargado.');
		}
		if (actionName === 'restoreLocalBackup') {
			const file = formData.get('backup');
			if (!(file instanceof File)) throw new Error('Selecciona un archivo de respaldo.');
			await importBackup(file);
			return success(actionName, 'Datos restaurados.');
		}

		await mutate(async (data) => {
			if (actionName === 'createBank' || actionName === 'updateBank') {
				const bank: Bank = { id: text(formData, 'id') || id('bank'), name: text(formData, 'name').trim(), alias: text(formData, 'alias').trim(), color: colorInputToHex(text(formData, 'color')) ?? '#2563eb' };
				data.banks = data.banks.filter((item) => item.id !== bank.id).concat(bank);
			}
			if (actionName === 'deleteBank') data.banks = data.banks.filter((bank) => bank.id !== text(formData, 'id'));

			if (actionName === 'createCategory' || actionName === 'updateCategory') {
				const category: Category = {
					id: text(formData, 'id') || id('category'),
					name: text(formData, 'name').trim(),
					color: colorInputToHex(text(formData, 'color')) as `#${string}` | null,
					parentId: optionalId(text(formData, 'parentId')),
					isEssential: bool(formData, 'isEssential'),
					createdAt: now(),
					updatedAt: now()
				};
				data.categories = data.categories.filter((item) => item.id !== category.id).concat(category);
			}
			if (actionName === 'deleteCategory') data.categories = data.categories.filter((category) => category.id !== text(formData, 'id'));

			if (['createAccount', 'updateAccount', 'createCard', 'updateCard'].includes(actionName)) {
				const existing = data.accounts.find((account) => account.id === text(formData, 'id'));
				const type = (text(formData, 'accountType') || text(formData, 'kind') || existing?.type || 'debit') as Account['type'];
				const account: Account = {
					id: existing?.id ?? id('account'),
					name: (text(formData, 'name') || text(formData, 'alias')).trim(),
					type,
					bankId: type === 'personal' ? null : optionalId(text(formData, 'bankId')),
					bank: null,
					cardLastFourDigits: type === 'debit' ? (text(formData, 'cardLastFourDigits') || text(formData, 'lastFourDigits')).trim() : text(formData, 'lastFourDigits') || null,
					cardColor: colorInputToHex(text(formData, 'cardColor') || text(formData, 'color')) ?? existing?.cardColor ?? '#2563eb',
					balanceCents: existing?.balanceCents ?? amountCents(formData.get('initialBalance')),
					balanceAsOfDate: text(formData, 'balanceAsOfDate') || existing?.balanceAsOfDate || new Date().toISOString().slice(0, 10),
					creditLimitCents: type === 'credit' ? amountCents(formData.get('creditLimit') ?? formData.get('maximumOfferedCredit')) : null,
					statementDay: type === 'credit' ? Number(text(formData, 'statementDay')) || null : null,
					paymentDueDay: type === 'credit' ? Number(text(formData, 'paymentDueDay')) || null : null,
					isActive: type === 'credit' ? bool(formData, 'isActive') : true,
					createdAt: existing?.createdAt ?? now(),
					updatedAt: now(),
					adjustments: existing?.adjustments ?? []
				};
				data.accounts = data.accounts.filter((item) => item.id !== account.id).concat(account);
			}
			if (actionName === 'toggleCreditAccountActive') {
				const account = data.accounts.find((item) => item.id === text(formData, 'id'));
				if (account) account.isActive = bool(formData, 'isActive');
			}
			if (actionName === 'adjustAccountBalance' || actionName === 'adjustCardBalance') {
				const account = data.accounts.find((item) => item.id === text(formData, 'id') || item.id === text(formData, 'cardId'));
				if (!account) throw new Error('Cuenta no encontrada.');
				const newBalance = amountCents(formData.get('newBalance') ?? formData.get('balanceAmount'));
				const diff = newBalance - account.balanceCents;
				const movement: StoredMovement = {
					id: id('movement'),
					type: 'adjustment',
					title: 'Ajuste de saldo',
					description: text(formData, 'reason'),
					amountCents: Math.abs(diff),
					currencyCode: 'MXN',
					paymentMode: 'cash',
					installmentCount: null,
					interestFree: false,
					occurredAt: now(),
					sourceAccountId: diff < 0 ? account.id : null,
					destinationAccountId: diff > 0 ? account.id : null,
					categoryId: null,
					recurringExpenseId: null,
					recurringIncomeId: null,
					loanId: null,
					active: true,
					createdAt: now(),
					updatedAt: now(),
					deletedAt: null
				};
				account.balanceCents = newBalance;
				data.movements.push(movement);
			}
			if (actionName === 'deleteAccount' || actionName === 'deleteCard') data.accounts = data.accounts.filter((account) => account.id !== text(formData, 'id') || account.type === 'personal');

			if (actionName === 'createMovement' || actionName === 'updateMovement') {
				const movement = movementFromForm(formData);
				const existing = data.movements.find((item) => item.id === movement.id);
				if (existing) reverseMovement(data.accounts, existing);
				applyMovement(data.accounts, movement);
				data.movements = data.movements.filter((item) => item.id !== movement.id).concat({ ...movement, createdAt: existing?.createdAt ?? movement.createdAt });
			}
			if (actionName === 'deleteMovement') {
				const movement = data.movements.find((item) => item.id === text(formData, 'id'));
				if (movement && movement.active) {
					reverseMovement(data.accounts, movement);
					movement.active = false;
					movement.deletedAt = now();
					movement.updatedAt = now();
				}
			}
			if (actionName === 'bulkCreateMovements') {
				const drafts = JSON.parse(text(formData, 'movements')) as Array<Record<string, string>>;
				for (const draft of drafts) {
					const draftForm = new FormData();
					for (const [key, value] of Object.entries(draft)) draftForm.set(key, value);
					const movement = movementFromForm(draftForm);
					applyMovement(data.accounts, movement);
					data.movements.push(movement);
				}
			}
			if (actionName === 'bulkDeleteMovements') {
				for (const movementId of formData.getAll('ids').filter((value): value is string => typeof value === 'string')) {
					const movement = data.movements.find((item) => item.id === movementId);
					if (movement && movement.active) {
						reverseMovement(data.accounts, movement);
						movement.active = false;
						movement.deletedAt = now();
						movement.updatedAt = now();
					}
				}
			}

			if (['createRecurringIncome', 'updateRecurringIncome'].includes(actionName)) {
				const income: RecurringIncome = { id: text(formData, 'id') || id('income'), title: text(formData, 'title'), expectedAmountCents: amountCents(formData.get('expectedAmount')), source: text(formData, 'source') as IncomeSource, frequency: text(formData, 'frequency') as IncomeFrequency, paymentSchedule: paymentSchedule(formData), workSchedule: text(formData, 'workSchedule') ? JSON.parse(text(formData, 'workSchedule')) as WorkSchedule : null, isActive: bool(formData, 'isActive'), createdAt: now(), updatedAt: now() };
				data.recurringIncomes = data.recurringIncomes.filter((item) => item.id !== income.id).concat(income);
			}
			if (actionName === 'deleteRecurringIncome') data.recurringIncomes = data.recurringIncomes.filter((income) => income.id !== text(formData, 'id'));
			if (['createRecurringExpense', 'updateRecurringExpense'].includes(actionName)) {
				const frequency = text(formData, 'frequency');
				const expense: RecurringExpense = { id: text(formData, 'id') || id('expense'), name: text(formData, 'name'), categoryId: text(formData, 'categoryId'), category: null, paymentAccountId: optionalId(text(formData, 'paymentAccountId')), paymentAccount: null, amountCents: amountCents(formData.get('amount')), amountKind: text(formData, 'amountKind') as ExpenseAmountKind, frequency: frequency as RecurringExpense['frequency'], customIntervalCount: frequency === 'custom' ? Number(text(formData, 'customIntervalCount')) || null : null, customIntervalUnit: frequency === 'custom' ? text(formData, 'customIntervalUnit') as ExpenseIntervalUnit : null, paymentSchedule: expenseSchedule(formData), statementDay: text(formData, 'statementDay') ? Number(text(formData, 'statementDay')) : null, lastPaidAt: text(formData, 'lastPaidAt') || null, nextOccurrenceAt: null, isActive: bool(formData, 'isActive'), createdAt: now(), updatedAt: now() };
				data.recurringExpenses = data.recurringExpenses.filter((item) => item.id !== expense.id).concat(expense);
			}
			if (actionName === 'deleteRecurringExpense') data.recurringExpenses = data.recurringExpenses.filter((expense) => expense.id !== text(formData, 'id'));

			if (['createFinancialGoal', 'updateFinancialGoal'].includes(actionName)) {
				const goal: FinancialGoal = { id: text(formData, 'id') || id('goal'), name: text(formData, 'name'), targetAmountCents: amountCents(formData.get('targetAmount')), currentAmountCents: amountCents(formData.get('currentAmount')), distributionPercentage: Number(text(formData, 'distributionPercentage')) || 0, currencyCode: text(formData, 'currencyCode') || 'MXN', priority: text(formData, 'priority') as FinancialGoal['priority'], status: text(formData, 'status') as FinancialGoal['status'], type: text(formData, 'type') as FinancialGoal['type'], createdAt: now(), updatedAt: now() };
				data.financialGoals = data.financialGoals.filter((item) => item.id !== goal.id).concat(goal);
			}
			if (actionName === 'deleteFinancialGoal') data.financialGoals = data.financialGoals.filter((goal) => goal.id !== text(formData, 'id'));

			if (['createLoan', 'updateLoan'].includes(actionName)) {
				const loan: Loan = { id: text(formData, 'id') || id('loan'), name: text(formData, 'name'), direction: text(formData, 'direction') as Loan['direction'], counterpartyName: text(formData, 'counterpartyName'), principalAmountCents: amountCents(formData.get('principalAmount')), totalRepaymentCents: amountCents(formData.get('totalRepayment')), installmentCount: Number(text(formData, 'installmentCount')) || 1, firstPaymentDate: text(formData, 'firstPaymentDate'), currencyCode: text(formData, 'currencyCode') || 'MXN', status: 'active', createdAt: now(), updatedAt: now(), cancelledAt: null };
				data.loans = data.loans.filter((item) => item.id !== loan.id).concat(loan);
			}
			if (actionName === 'cancelLoan') {
				const loan = data.loans.find((item) => item.id === text(formData, 'id'));
				if (loan) { loan.status = 'cancelled'; loan.cancelledAt = now(); }
			}
			if (actionName === 'deleteLoan') data.loans = data.loans.filter((loan) => loan.id !== text(formData, 'id'));
			if (actionName === 'registerPayment' || actionName === 'registerCollection') {
				const loan = data.loans.find((item) => item.id === text(formData, 'id'));
				if (!loan) throw new Error('Prestamo no encontrado.');
				const movement: StoredMovement = { id: id('movement'), type: actionName === 'registerPayment' ? 'loan_payment' : 'loan_collection', title: actionName === 'registerPayment' ? `Pago de ${loan.name}` : `Cobro de ${loan.name}`, description: text(formData, 'description') || null, amountCents: amountCents(formData.get('amount')), currencyCode: 'MXN', paymentMode: 'cash', installmentCount: null, interestFree: false, occurredAt: dateTime(text(formData, 'occurredAt')), sourceAccountId: actionName === 'registerPayment' ? text(formData, 'accountId') : null, destinationAccountId: actionName === 'registerCollection' ? text(formData, 'accountId') : null, categoryId: null, recurringExpenseId: null, recurringIncomeId: null, loanId: loan.id, active: true, createdAt: now(), updatedAt: now(), deletedAt: null };
				applyMovement(data.accounts, movement);
				data.movements.push(movement);
			}

			if (['createInstallmentPurchase', 'updateInstallmentPurchase'].includes(actionName)) {
				const purchase: InstallmentPurchase = { id: text(formData, 'id') || id('purchase'), accountId: text(formData, 'accountId'), description: text(formData, 'description'), purchaseDate: text(formData, 'purchaseDate'), originalAmountCents: amountCents(formData.get('originalAmount')), installmentAmountCents: amountCents(formData.get('installmentAmount')), totalInstallments: Number(text(formData, 'totalInstallments')) || 1, billedInstallments: Number(text(formData, 'billedInstallments')) || 0, paidInstallments: Number(text(formData, 'paidInstallments')) || 0, createdAt: now(), updatedAt: now() };
				data.installmentPurchases = data.installmentPurchases.filter((item) => item.id !== purchase.id).concat(purchase);
			}
			if (actionName === 'deleteInstallmentPurchase') data.installmentPurchases = data.installmentPurchases.filter((purchase) => purchase.id !== text(formData, 'id'));
			if (['createCreditCardStatement', 'updateCreditCardStatement', 'registerCardStatement'].includes(actionName)) {
				const today = new Date().toISOString().slice(0, 10);
				const statement: CreditCardStatement = { id: text(formData, 'id') || id('statement'), accountId: text(formData, 'accountId') || text(formData, 'cardId'), periodStartDate: text(formData, 'periodStartDate') || today, periodEndDate: text(formData, 'periodEndDate') || today, statementDate: text(formData, 'statementDate') || today, paymentDueDate: text(formData, 'paymentDueDate') || today, statementBalanceCents: amountCents(formData.get('statementBalance') ?? formData.get('statementAmount')), paidAmountCents: amountCents(formData.get('paidAmount')) || 0, createdAt: now(), updatedAt: now() };
				data.creditCardStatements = data.creditCardStatements.filter((item) => item.id !== statement.id).concat(statement);
			}
			if (actionName === 'payCreditInstallment' || actionName === 'unpayCreditInstallment') {
				const purchase = data.installmentPurchases.find((item) => item.id === text(formData, 'movementId'));
				if (purchase) {
					purchase.paidInstallments += actionName === 'payCreditInstallment' ? 1 : -1;
					purchase.paidInstallments = Math.max(0, Math.min(purchase.totalInstallments, purchase.paidInstallments));
					purchase.updatedAt = now();
				}
			}
		});
		await invalidateAll();
		return success(actionName, 'Cambio guardado en este dispositivo.');
	} catch (error) {
		return failure(actionName, error);
	}
}

export function installLocalFormHandler(setFeedback: (feedback: LocalFormFeedback | null) => void) {
	if (!browser) return () => {};
	const listener = async (event: SubmitEvent) => {
		const form = event.target;
		if (!(form instanceof HTMLFormElement)) return;
		const action = form.getAttribute('action') ?? '';
		if (!action.startsWith('?/')) return;
		event.preventDefault();
		const actionName = action.slice(2);
		const feedback = await handleLocalForm(actionName, new FormData(form));
		setFeedback(feedback);
	};
	document.addEventListener('submit', listener);
	return () => document.removeEventListener('submit', listener);
}
